
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function object_without_properties(obj, exclude) {
        const target = {};
        for (const k in obj) {
            if (has_prop(obj, k)
                // @ts-ignore
                && exclude.indexOf(k) === -1) {
                // @ts-ignore
                target[k] = obj[k];
            }
        }
        return target;
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Example1.svelte generated by Svelte v3.59.2 */

    const file$5 = "src/Example1.svelte";

    // (14:2) {#if count >3 }
    function create_if_block_5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "count > 3";
    			add_location(div, file$5, 14, 4, 211);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(14:2) {#if count >3 }",
    		ctx
    	});

    	return block;
    }

    // (23:2) {:else}
    function create_else_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "count <= 3";
    			add_location(div, file$5, 23, 4, 347);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(23:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:2) {#if count >3 }
    function create_if_block_4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "count > 3";
    			add_location(div, file$5, 21, 4, 309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(21:2) {#if count >3 }",
    		ctx
    	});

    	return block;
    }

    // (34:2) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "count <= 3";
    			add_location(div, file$5, 34, 4, 537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(34:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:24) 
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "count = 3";
    			add_location(div, file$5, 32, 4, 502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(32:24) ",
    		ctx
    	});

    	return block;
    }

    // (30:2) {#if count >3 }
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "count > 3";
    			add_location(div, file$5, 30, 4, 449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(30:2) {#if count >3 }",
    		ctx
    	});

    	return block;
    }

    // (42:2) {#if count >3 }
    function create_if_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*count*/ ctx[0] === 5) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_2(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(42:2) {#if count >3 }",
    		ctx
    	});

    	return block;
    }

    // (45:4) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("count > 3");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(45:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if count === 5 }
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("count = 5");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(43:4) {#if count === 5 }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let h20;
    	let t4;
    	let t5;
    	let section0;
    	let h21;
    	let t7;
    	let t8;
    	let section1;
    	let h22;
    	let t10;
    	let t11;
    	let section2;
    	let h23;
    	let t13;
    	let t14;
    	let section3;
    	let h24;
    	let t16;
    	let mounted;
    	let dispose;
    	let if_block0 = /*count*/ ctx[0] > 3 && create_if_block_5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*count*/ ctx[0] > 3) return create_if_block_4;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*count*/ ctx[0] > 3) return create_if_block_2;
    		if (/*count*/ ctx[0] === 3) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1(ctx);
    	let if_block3 = /*count*/ ctx[0] > 3 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "증가!";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "감소!";
    			t3 = space();
    			h20 = element("h2");
    			t4 = text(/*count*/ ctx[0]);
    			t5 = space();
    			section0 = element("section");
    			h21 = element("h2");
    			h21.textContent = "1. if";
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			section1 = element("section");
    			h22 = element("h2");
    			h22.textContent = "2. if else";
    			t10 = space();
    			if_block1.c();
    			t11 = space();
    			section2 = element("section");
    			h23 = element("h2");
    			h23.textContent = "3. if else if";
    			t13 = space();
    			if_block2.c();
    			t14 = space();
    			section3 = element("section");
    			h24 = element("h2");
    			h24.textContent = "4. 다중 블록";
    			t16 = space();
    			if (if_block3) if_block3.c();
    			add_location(button0, file$5, 6, 0, 41);
    			add_location(button1, file$5, 7, 0, 92);
    			add_location(h20, file$5, 9, 0, 144);
    			add_location(h21, file$5, 12, 2, 174);
    			attr_dev(section0, "class", "svelte-1jxbt2p");
    			add_location(section0, file$5, 11, 0, 162);
    			add_location(h22, file$5, 19, 2, 267);
    			attr_dev(section1, "class", "svelte-1jxbt2p");
    			add_location(section1, file$5, 18, 0, 255);
    			add_location(h23, file$5, 28, 2, 404);
    			attr_dev(section2, "class", "svelte-1jxbt2p");
    			add_location(section2, file$5, 27, 0, 392);
    			add_location(h24, file$5, 40, 2, 676);
    			attr_dev(section3, "class", "svelte-1jxbt2p");
    			add_location(section3, file$5, 38, 0, 582);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h21);
    			append_dev(section0, t7);
    			if (if_block0) if_block0.m(section0, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h22);
    			append_dev(section1, t10);
    			if_block1.m(section1, null);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, h23);
    			append_dev(section2, t13);
    			if_block2.m(section2, null);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, section3, anchor);
    			append_dev(section3, h24);
    			append_dev(section3, t16);
    			if (if_block3) if_block3.m(section3, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*count*/ 1) set_data_dev(t4, /*count*/ ctx[0]);

    			if (/*count*/ ctx[0] > 3) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(section0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(section1, null);
    				}
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(section2, null);
    				}
    			}

    			if (/*count*/ ctx[0] > 3) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					if_block3.m(section3, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(section0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(section1);
    			if_block1.d();
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(section2);
    			if_block2.d();
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(section3);
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example1', slots, []);
    	let count = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example1> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, count += 1);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, count -= 1);
    	};

    	$$self.$capture_state = () => ({ count });

    	$$self.$inject_state = $$props => {
    		if ('count' in $$props) $$invalidate(0, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [count, click_handler, click_handler_1];
    }

    class Example1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example1",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Example2.svelte generated by Svelte v3.59.2 */

    const file$4 = "src/Example2.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (31:4) {#each fruits as fruit (fruit)}
    function create_each_block_1$1(key_1, ctx) {
    	let li;
    	let t_value = /*fruit*/ ctx[3] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$4, 31, 8, 736);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*fruits*/ 1 && t_value !== (t_value = /*fruit*/ ctx[3] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(31:4) {#each fruits as fruit (fruit)}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#each fruits2 as fruit (fruit.id)}
    function create_each_block$1(key_1, ctx) {
    	let li;
    	let t_value = /*fruit*/ ctx[3].name + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$4, 38, 8, 852);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*fruits2*/ 2 && t_value !== (t_value = /*fruit*/ ctx[3].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(38:4) {#each fruits2 as fruit (fruit.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let button;
    	let t1;
    	let br;
    	let t2;
    	let ul0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t3;
    	let ul1;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value_1 = /*fruits*/ ctx[0];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*fruit*/ ctx[3];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$1(key, child_ctx));
    	}

    	let each_value = /*fruits2*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*fruit*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete first fruit!!";
    			t1 = space();
    			br = element("br");
    			t2 = text("\n1. 일반 배열\n");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = text("\n\n2. 객체로 id를 세팅하여 키를 세팅하는 방법\n");
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(button, file$4, 18, 0, 350);
    			add_location(br, file$4, 22, 0, 418);
    			add_location(ul0, file$4, 24, 0, 433);
    			add_location(ul1, file$4, 36, 0, 799);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(ul0, null);
    				}
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul1, null);
    				}
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*deleteFirst*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fruits*/ 1) {
    				each_value_1 = /*fruits*/ ctx[0];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, ul0, destroy_block, create_each_block_1$1, null, get_each_context_1$1);
    			}

    			if (dirty & /*fruits2*/ 2) {
    				each_value = /*fruits2*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, ul1, destroy_block, create_each_block$1, null, get_each_context$1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example2', slots, []);
    	let fruits = ['Apple', 'Banana', 'Cherry', 'Orange'];

    	let fruits2 = [
    		{ id: '1', name: 'Apple' },
    		{ id: '2', name: 'Banana' },
    		{ id: '3', name: 'Cherry' },
    		{ id: '4', name: 'Orange' }
    	];

    	function deleteFirst() {
    		$$invalidate(0, fruits = fruits.slice(1));
    		$$invalidate(1, fruits2 = fruits2.slice(1));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example2> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fruits, fruits2, deleteFirst });

    	$$self.$inject_state = $$props => {
    		if ('fruits' in $$props) $$invalidate(0, fruits = $$props.fruits);
    		if ('fruits2' in $$props) $$invalidate(1, fruits2 = $$props.fruits2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fruits, fruits2, deleteFirst];
    }

    class Example2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example2",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Example3.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$3 = "src/Example3.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i].id;
    	child_ctx[9] = object_without_properties(list[i], ["id"]);
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i][0];
    	child_ctx[12] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i].id;
    	child_ctx[12] = list[i].name;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (26:4) {#each fruits as fruit}
    function create_each_block_7(ctx) {
    	let div;
    	let t_value = /*fruit*/ ctx[20].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$3, 26, 8, 547);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(26:4) {#each fruits as fruit}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#each fruits as fruit, index}
    function create_each_block_6(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2_value = /*fruit*/ ctx[20].name + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*index*/ ctx[22]);
    			t1 = text(" / ");
    			t2 = text(t2_value);
    			add_location(div, file$3, 34, 8, 714);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(34:4) {#each fruits as fruit, index}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#each fruits as fruit, index (fruit.id)}
    function create_each_block_5(key_1, ctx) {
    	let div;
    	let t0_value = /*index*/ ctx[22] + "";
    	let t0;
    	let t1;
    	let t2_value = /*fruit*/ ctx[20].name + "";
    	let t2;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(t2_value);
    			add_location(div, file$3, 42, 8, 908);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(42:4) {#each fruits as fruit, index (fruit.id)}",
    		ctx
    	});

    	return block;
    }

    // (53:4) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "아이템이 없어요!";
    			add_location(div, file$3, 53, 8, 1172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(53:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {#each todos as todo (todo.id)}
    function create_each_block_4(key_1, ctx) {
    	let div;
    	let t_value = /*todo*/ ctx[17].name + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$3, 51, 8, 1129);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(51:4) {#each todos as todo (todo.id)}",
    		ctx
    	});

    	return block;
    }

    // (62:4) {#each fruits as {id, name}
    function create_each_block_3(key_1, ctx) {
    	let div;
    	let t_value = /*name*/ ctx[12] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$3, 62, 8, 1426);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(62:4) {#each fruits as {id, name}",
    		ctx
    	});

    	return block;
    }

    // (71:4) {#each fruits2D as [id, name] (id)}
    function create_each_block_2(key_1, ctx) {
    	let div;
    	let t_value = /*name*/ ctx[12] + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$3, 71, 8, 1628);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(71:4) {#each fruits2D as [id, name] (id)}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {#each fruits as {id, ...rest}
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let t_value = /*rest*/ ctx[9].name + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$3, 80, 8, 1871);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(80:4) {#each fruits as {id, ...rest}",
    		ctx
    	});

    	return block;
    }

    // (88:4) {#each Object.entries(user) as [key, value] (key)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let t0_value = /*key*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let t2_value = /*value*/ ctx[5] + "";
    	let t2;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			t2 = text(t2_value);
    			add_location(div, file$3, 88, 8, 2084);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(88:4) {#each Object.entries(user) as [key, value] (key)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section0;
    	let h20;
    	let t1;
    	let t2;
    	let section1;
    	let h21;
    	let t4;
    	let t5;
    	let section2;
    	let h22;
    	let t7;
    	let each_blocks_5 = [];
    	let each2_lookup = new Map();
    	let t8;
    	let section3;
    	let h23;
    	let t10;
    	let each_blocks_4 = [];
    	let each3_lookup = new Map();
    	let t11;
    	let section4;
    	let h24;
    	let t13;
    	let each_blocks_3 = [];
    	let each4_lookup = new Map();
    	let t14;
    	let section5;
    	let h25;
    	let t16;
    	let each_blocks_2 = [];
    	let each5_lookup = new Map();
    	let t17;
    	let section6;
    	let h26;
    	let t19;
    	let each_blocks_1 = [];
    	let each6_lookup = new Map();
    	let t20;
    	let section7;
    	let h27;
    	let t22;
    	let each_blocks = [];
    	let each7_lookup = new Map();
    	let each_value_7 = /*fruits*/ ctx[0];
    	validate_each_argument(each_value_7);
    	let each_blocks_7 = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks_7[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	let each_value_6 = /*fruits*/ ctx[0];
    	validate_each_argument(each_value_6);
    	let each_blocks_6 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_6[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	let each_value_5 = /*fruits*/ ctx[0];
    	validate_each_argument(each_value_5);
    	const get_key = ctx => /*fruit*/ ctx[20].id;
    	validate_each_keys(ctx, each_value_5, get_each_context_5, get_key);

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		let child_ctx = get_each_context_5(ctx, each_value_5, i);
    		let key = get_key(child_ctx);
    		each2_lookup.set(key, each_blocks_5[i] = create_each_block_5(key, child_ctx));
    	}

    	let each_value_4 = /*todos*/ ctx[1];
    	validate_each_argument(each_value_4);
    	const get_key_1 = ctx => /*todo*/ ctx[17].id;
    	validate_each_keys(ctx, each_value_4, get_each_context_4, get_key_1);

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		let child_ctx = get_each_context_4(ctx, each_value_4, i);
    		let key = get_key_1(child_ctx);
    		each3_lookup.set(key, each_blocks_4[i] = create_each_block_4(key, child_ctx));
    	}

    	let each3_else = null;

    	if (!each_value_4.length) {
    		each3_else = create_else_block(ctx);
    	}

    	let each_value_3 = /*fruits*/ ctx[0];
    	validate_each_argument(each_value_3);
    	const get_key_2 = ctx => /*id*/ ctx[8];
    	validate_each_keys(ctx, each_value_3, get_each_context_3, get_key_2);

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key_2(child_ctx);
    		each4_lookup.set(key, each_blocks_3[i] = create_each_block_3(key, child_ctx));
    	}

    	let each_value_2 = /*fruits2D*/ ctx[2];
    	validate_each_argument(each_value_2);
    	const get_key_3 = ctx => /*id*/ ctx[8];
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_3);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key_3(child_ctx);
    		each5_lookup.set(key, each_blocks_2[i] = create_each_block_2(key, child_ctx));
    	}

    	let each_value_1 = /*fruits*/ ctx[0];
    	validate_each_argument(each_value_1);
    	const get_key_4 = ctx => /*id*/ ctx[8];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_4);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key_4(child_ctx);
    		each6_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = Object.entries(/*user*/ ctx[3]);
    	validate_each_argument(each_value);
    	const get_key_5 = ctx => /*key*/ ctx[4];
    	validate_each_keys(ctx, each_value, get_each_context, get_key_5);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_5(child_ctx);
    		each7_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "기본";
    			t1 = space();

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].c();
    			}

    			t2 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "순서 (index)";
    			t4 = space();

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].c();
    			}

    			t5 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "아이템 고유화(key)";
    			t7 = space();

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].c();
    			}

    			t8 = space();
    			section3 = element("section");
    			h23 = element("h2");
    			h23.textContent = "빈 배열 처리(else)";
    			t10 = space();

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			if (each3_else) {
    				each3_else.c();
    			}

    			t11 = space();
    			section4 = element("section");
    			h24 = element("h2");
    			h24.textContent = "구조 분해 (destructuring)";
    			t13 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t14 = space();
    			section5 = element("section");
    			h25 = element("h2");
    			h25.textContent = "2차원 배열";
    			t16 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t17 = space();
    			section6 = element("section");
    			h26 = element("h2");
    			h26.textContent = "나머지 연산자 (rest)";
    			t19 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t20 = space();
    			section7 = element("section");
    			h27 = element("h2");
    			h27.textContent = "객체 데이터";
    			t22 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h20, file$3, 23, 4, 461);
    			attr_dev(section0, "class", "svelte-g6kzup");
    			add_location(section0, file$3, 22, 0, 447);
    			add_location(h21, file$3, 31, 4, 609);
    			attr_dev(section1, "class", "svelte-g6kzup");
    			add_location(section1, file$3, 30, 0, 595);
    			add_location(h22, file$3, 39, 4, 786);
    			attr_dev(section2, "class", "svelte-g6kzup");
    			add_location(section2, file$3, 38, 0, 772);
    			add_location(h23, file$3, 47, 4, 980);
    			attr_dev(section3, "class", "svelte-g6kzup");
    			add_location(section3, file$3, 46, 0, 966);
    			add_location(h24, file$3, 58, 4, 1231);
    			attr_dev(section4, "class", "svelte-g6kzup");
    			add_location(section4, file$3, 57, 0, 1217);
    			add_location(h25, file$3, 67, 4, 1482);
    			attr_dev(section5, "class", "svelte-g6kzup");
    			add_location(section5, file$3, 66, 0, 1468);
    			add_location(h26, file$3, 76, 4, 1684);
    			attr_dev(section6, "class", "svelte-g6kzup");
    			add_location(section6, file$3, 75, 0, 1670);
    			add_location(h27, file$3, 85, 4, 1932);
    			attr_dev(section7, "class", "svelte-g6kzup");
    			add_location(section7, file$3, 84, 0, 1918);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h20);
    			append_dev(section0, t1);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				if (each_blocks_7[i]) {
    					each_blocks_7[i].m(section0, null);
    				}
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h21);
    			append_dev(section1, t4);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				if (each_blocks_6[i]) {
    					each_blocks_6[i].m(section1, null);
    				}
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, h22);
    			append_dev(section2, t7);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				if (each_blocks_5[i]) {
    					each_blocks_5[i].m(section2, null);
    				}
    			}

    			insert_dev(target, t8, anchor);
    			insert_dev(target, section3, anchor);
    			append_dev(section3, h23);
    			append_dev(section3, t10);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				if (each_blocks_4[i]) {
    					each_blocks_4[i].m(section3, null);
    				}
    			}

    			if (each3_else) {
    				each3_else.m(section3, null);
    			}

    			insert_dev(target, t11, anchor);
    			insert_dev(target, section4, anchor);
    			append_dev(section4, h24);
    			append_dev(section4, t13);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				if (each_blocks_3[i]) {
    					each_blocks_3[i].m(section4, null);
    				}
    			}

    			insert_dev(target, t14, anchor);
    			insert_dev(target, section5, anchor);
    			append_dev(section5, h25);
    			append_dev(section5, t16);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(section5, null);
    				}
    			}

    			insert_dev(target, t17, anchor);
    			insert_dev(target, section6, anchor);
    			append_dev(section6, h26);
    			append_dev(section6, t19);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(section6, null);
    				}
    			}

    			insert_dev(target, t20, anchor);
    			insert_dev(target, section7, anchor);
    			append_dev(section7, h27);
    			append_dev(section7, t22);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(section7, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fruits*/ 1) {
    				each_value_7 = /*fruits*/ ctx[0];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks_7[i]) {
    						each_blocks_7[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_7[i] = create_each_block_7(child_ctx);
    						each_blocks_7[i].c();
    						each_blocks_7[i].m(section0, null);
    					}
    				}

    				for (; i < each_blocks_7.length; i += 1) {
    					each_blocks_7[i].d(1);
    				}

    				each_blocks_7.length = each_value_7.length;
    			}

    			if (dirty & /*fruits*/ 1) {
    				each_value_6 = /*fruits*/ ctx[0];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_6[i]) {
    						each_blocks_6[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_6[i] = create_each_block_6(child_ctx);
    						each_blocks_6[i].c();
    						each_blocks_6[i].m(section1, null);
    					}
    				}

    				for (; i < each_blocks_6.length; i += 1) {
    					each_blocks_6[i].d(1);
    				}

    				each_blocks_6.length = each_value_6.length;
    			}

    			if (dirty & /*fruits*/ 1) {
    				each_value_5 = /*fruits*/ ctx[0];
    				validate_each_argument(each_value_5);
    				validate_each_keys(ctx, each_value_5, get_each_context_5, get_key);
    				each_blocks_5 = update_keyed_each(each_blocks_5, dirty, get_key, 1, ctx, each_value_5, each2_lookup, section2, destroy_block, create_each_block_5, null, get_each_context_5);
    			}

    			if (dirty & /*todos*/ 2) {
    				each_value_4 = /*todos*/ ctx[1];
    				validate_each_argument(each_value_4);
    				validate_each_keys(ctx, each_value_4, get_each_context_4, get_key_1);
    				each_blocks_4 = update_keyed_each(each_blocks_4, dirty, get_key_1, 1, ctx, each_value_4, each3_lookup, section3, destroy_block, create_each_block_4, null, get_each_context_4);

    				if (!each_value_4.length && each3_else) {
    					each3_else.p(ctx, dirty);
    				} else if (!each_value_4.length) {
    					each3_else = create_else_block(ctx);
    					each3_else.c();
    					each3_else.m(section3, null);
    				} else if (each3_else) {
    					each3_else.d(1);
    					each3_else = null;
    				}
    			}

    			if (dirty & /*fruits*/ 1) {
    				each_value_3 = /*fruits*/ ctx[0];
    				validate_each_argument(each_value_3);
    				validate_each_keys(ctx, each_value_3, get_each_context_3, get_key_2);
    				each_blocks_3 = update_keyed_each(each_blocks_3, dirty, get_key_2, 1, ctx, each_value_3, each4_lookup, section4, destroy_block, create_each_block_3, null, get_each_context_3);
    			}

    			if (dirty & /*fruits2D*/ 4) {
    				each_value_2 = /*fruits2D*/ ctx[2];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_3);
    				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key_3, 1, ctx, each_value_2, each5_lookup, section5, destroy_block, create_each_block_2, null, get_each_context_2);
    			}

    			if (dirty & /*fruits*/ 1) {
    				each_value_1 = /*fruits*/ ctx[0];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_4);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_4, 1, ctx, each_value_1, each6_lookup, section6, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*Object, user*/ 8) {
    				each_value = Object.entries(/*user*/ ctx[3]);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key_5);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_5, 1, ctx, each_value, each7_lookup, section7, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_each(each_blocks_7, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section1);
    			destroy_each(each_blocks_6, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(section2);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].d();
    			}

    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(section3);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].d();
    			}

    			if (each3_else) each3_else.d();
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(section4);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].d();
    			}

    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(section5);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(section6);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(section7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example3', slots, []);

    	let fruits = [
    		{ id: '1', name: 'Apple' },
    		{ id: '2', name: 'Banana' },
    		{ id: '3', name: 'Cherry' },
    		{ id: '4', name: 'Apple' },
    		{ id: '5', name: 'Orange' }
    	];

    	let todos = [];
    	let fruits2D = [[1, 'Apple'], [2, 'Banana'], [3, 'Cherry'], [4, 'Orange']];

    	let user = {
    		name: 'amps',
    		age: 100,
    		email: 'test@gmail.com'
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example3> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fruits, todos, fruits2D, user });

    	$$self.$inject_state = $$props => {
    		if ('fruits' in $$props) $$invalidate(0, fruits = $$props.fruits);
    		if ('todos' in $$props) $$invalidate(1, todos = $$props.todos);
    		if ('fruits2D' in $$props) $$invalidate(2, fruits2D = $$props.fruits2D);
    		if ('user' in $$props) $$invalidate(3, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fruits, todos, fruits2D, user];
    }

    class Example3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example3",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Count.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/Count.svelte";

    function create_fragment$2(ctx) {
    	let h1;
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(/*count*/ ctx[0]);
    			add_location(h1, file$2, 7, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*count*/ 1) set_data_dev(t, /*count*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Count', slots, []);
    	let count = 0;

    	setInterval(
    		() => {
    			$$invalidate(0, count += 1);
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Count> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ count });

    	$$self.$inject_state = $$props => {
    		if ('count' in $$props) $$invalidate(0, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [count];
    }

    class Count extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Count",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Example4.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/Example4.svelte";

    // (10:0) {#key reset}
    function create_key_block(ctx) {
    	let count;
    	let current;
    	count = new Count({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(count.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(count, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(count.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(count.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(count, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(10:0) {#key reset}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let previous_key = /*reset*/ ctx[0];
    	let t0;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "Reset!";
    			add_location(button, file$1, 13, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*reset*/ 1 && safe_not_equal(previous_key, previous_key = /*reset*/ ctx[0])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(t0.parentNode, t0);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			key_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example4', slots, []);
    	let reset = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example4> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, reset = !reset);
    	$$self.$capture_state = () => ({ Count, reset });

    	$$self.$inject_state = $$props => {
    		if ('reset' in $$props) $$invalidate(0, reset = $$props.reset);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [reset, click_handler];
    }

    class Example4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example4",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let h1;
    	let t1;
    	let example4;
    	let current;
    	example4 = new Example4({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "4.키 블록";
    			t1 = space();
    			create_component(example4.$$.fragment);
    			add_location(h1, file, 17, 0, 344);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(example4, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(example4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(example4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			destroy_component(example4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Example1, Example2, Example3, Example4 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
