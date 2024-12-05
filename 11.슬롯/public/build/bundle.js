
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }

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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
                    update$1(component.$$);
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
    function update$1($$) {
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
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

    /* src/Btn.svelte generated by Svelte v3.59.2 */

    const file$9 = "src/Btn.svelte";

    // (13:8) Default button!
    function fallback_block$1(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text("Default button!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(13:8) Default button!",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$c(ctx) {
    	let button;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_style(button, "background-color", /*color*/ ctx[1]);
    			set_style(button, "color", /*color*/ ctx[1] ? 'white' : '');
    			attr_dev(button, "class", "svelte-mxiy9m");
    			toggle_class(button, "block", /*block*/ ctx[0]);
    			add_location(button, file$9, 6, 0, 107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*color*/ 2) {
    				set_style(button, "background-color", /*color*/ ctx[1]);
    			}

    			if (!current || dirty & /*color*/ 2) {
    				set_style(button, "color", /*color*/ ctx[1] ? 'white' : '');
    			}

    			if (!current || dirty & /*block*/ 1) {
    				toggle_class(button, "block", /*block*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Btn', slots, ['default']);
    	let { block } = $$props;
    	let { color } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (block === undefined && !('block' in $$props || $$self.$$.bound[$$self.$$.props['block']])) {
    			console.warn("<Btn> was created without expected prop 'block'");
    		}

    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<Btn> was created without expected prop 'color'");
    		}
    	});

    	const writable_props = ['block', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Btn> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('block' in $$props) $$invalidate(0, block = $$props.block);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ block, color });

    	$$self.$inject_state = $$props => {
    		if ('block' in $$props) $$invalidate(0, block = $$props.block);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [block, color, $$scope, slots];
    }

    class Btn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { block: 0, color: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Btn",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get block() {
    		throw new Error("<Btn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Btn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Btn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Btn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example1.svelte generated by Svelte v3.59.2 */

    // (6:0) <Btn>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit!");
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
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(6:0) <Btn>",
    		ctx
    	});

    	return block;
    }

    // (7:0) <Btn block>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit!");
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(7:0) <Btn block>",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Btn color="royalblue">
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit!");
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
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(8:0) <Btn color=\\\"royalblue\\\">",
    		ctx
    	});

    	return block;
    }

    // (9:0) <Btn block color="red">
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Danger!");
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
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(9:0) <Btn block color=\\\"red\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let btn0;
    	let t0;
    	let btn1;
    	let t1;
    	let btn2;
    	let t2;
    	let btn3;
    	let t3;
    	let btn4;
    	let current;
    	btn0 = new Btn({ $$inline: true });

    	btn1 = new Btn({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn2 = new Btn({
    			props: {
    				block: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn3 = new Btn({
    			props: {
    				color: "royalblue",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn4 = new Btn({
    			props: {
    				block: true,
    				color: "red",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(btn0.$$.fragment);
    			t0 = space();
    			create_component(btn1.$$.fragment);
    			t1 = space();
    			create_component(btn2.$$.fragment);
    			t2 = space();
    			create_component(btn3.$$.fragment);
    			t3 = space();
    			create_component(btn4.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(btn0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(btn1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(btn2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(btn3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(btn4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);
    			const btn2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				btn2_changes.$$scope = { dirty, ctx };
    			}

    			btn2.$set(btn2_changes);
    			const btn3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				btn3_changes.$$scope = { dirty, ctx };
    			}

    			btn3.$set(btn3_changes);
    			const btn4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				btn4_changes.$$scope = { dirty, ctx };
    			}

    			btn4.$set(btn4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			transition_in(btn2.$$.fragment, local);
    			transition_in(btn3.$$.fragment, local);
    			transition_in(btn4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			transition_out(btn2.$$.fragment, local);
    			transition_out(btn3.$$.fragment, local);
    			transition_out(btn4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(btn0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(btn1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(btn2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(btn3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(btn4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example1', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example1> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Btn });
    	return [];
    }

    class Example1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example1",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Card.svelte generated by Svelte v3.59.2 */

    const file$8 = "src/Card.svelte";
    const get_email_slot_changes$1 = dirty => ({});

    const get_email_slot_context$1 = ctx => ({
    	domain: /*domain*/ ctx[0],
    	hello: "world"
    });

    const get_age_slot_changes$1 = dirty => ({});
    const get_age_slot_context$1 = ctx => ({});
    const get_name_slot_changes$1 = dirty => ({});
    const get_name_slot_context$1 = ctx => ({});

    // (6:20) !!
    function fallback_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("!!");
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
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(6:20) !!",
    		ctx
    	});

    	return block;
    }

    // (7:19) ??
    function fallback_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("??");
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
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(7:19) ??",
    		ctx
    	});

    	return block;
    }

    // (9:44) &&
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("&&");
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
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(9:44) &&",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	const name_slot_template = /*#slots*/ ctx[2].name;
    	const name_slot = create_slot(name_slot_template, ctx, /*$$scope*/ ctx[1], get_name_slot_context$1);
    	const name_slot_or_fallback = name_slot || fallback_block_2(ctx);
    	const age_slot_template = /*#slots*/ ctx[2].age;
    	const age_slot = create_slot(age_slot_template, ctx, /*$$scope*/ ctx[1], get_age_slot_context$1);
    	const age_slot_or_fallback = age_slot || fallback_block_1(ctx);
    	const email_slot_template = /*#slots*/ ctx[2].email;
    	const email_slot = create_slot(email_slot_template, ctx, /*$$scope*/ ctx[1], get_email_slot_context$1);
    	const email_slot_or_fallback = email_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (name_slot_or_fallback) name_slot_or_fallback.c();
    			t0 = space();
    			if (age_slot_or_fallback) age_slot_or_fallback.c();
    			t1 = space();
    			if (email_slot_or_fallback) email_slot_or_fallback.c();
    			attr_dev(div, "class", "card svelte-1g05dx2");
    			add_location(div, file$8, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (name_slot_or_fallback) {
    				name_slot_or_fallback.m(div, null);
    			}

    			append_dev(div, t0);

    			if (age_slot_or_fallback) {
    				age_slot_or_fallback.m(div, null);
    			}

    			append_dev(div, t1);

    			if (email_slot_or_fallback) {
    				email_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (name_slot) {
    				if (name_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						name_slot,
    						name_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(name_slot_template, /*$$scope*/ ctx[1], dirty, get_name_slot_changes$1),
    						get_name_slot_context$1
    					);
    				}
    			}

    			if (age_slot) {
    				if (age_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						age_slot,
    						age_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(age_slot_template, /*$$scope*/ ctx[1], dirty, get_age_slot_changes$1),
    						get_age_slot_context$1
    					);
    				}
    			}

    			if (email_slot) {
    				if (email_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						email_slot,
    						email_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(email_slot_template, /*$$scope*/ ctx[1], dirty, get_email_slot_changes$1),
    						get_email_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(name_slot_or_fallback, local);
    			transition_in(age_slot_or_fallback, local);
    			transition_in(email_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(name_slot_or_fallback, local);
    			transition_out(age_slot_or_fallback, local);
    			transition_out(email_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (name_slot_or_fallback) name_slot_or_fallback.d(detaching);
    			if (age_slot_or_fallback) age_slot_or_fallback.d(detaching);
    			if (email_slot_or_fallback) email_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['name','age','email']);
    	let domain = '@xyz.com';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ domain });

    	$$self.$inject_state = $$props => {
    		if ('domain' in $$props) $$invalidate(0, domain = $$props.domain);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [domain, $$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Example2.svelte generated by Svelte v3.59.2 */
    const file$7 = "src/Example2.svelte";

    // (6:2) 
    function create_age_slot_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "85";
    			attr_dev(div, "slot", "age");
    			add_location(div, file$7, 5, 2, 66);
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
    		id: create_age_slot_1$1.name,
    		type: "slot",
    		source: "(6:2) ",
    		ctx
    	});

    	return block;
    }

    // (7:2) 
    function create_name_slot_1$2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Heropy";
    			attr_dev(h2, "slot", "name");
    			add_location(h2, file$7, 6, 2, 93);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_name_slot_1$2.name,
    		type: "slot",
    		source: "(7:2) ",
    		ctx
    	});

    	return block;
    }

    // (8:2) 
    function create_email_slot_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "dddd@aaaa.cccc";
    			attr_dev(div, "slot", "email");
    			add_location(div, file$7, 7, 2, 123);
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
    		id: create_email_slot_1$2.name,
    		type: "slot",
    		source: "(8:2) ",
    		ctx
    	});

    	return block;
    }

    // (11:2) 
    function create_age_slot$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "82";
    			attr_dev(div, "slot", "age");
    			add_location(div, file$7, 10, 2, 179);
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
    		id: create_age_slot$2.name,
    		type: "slot",
    		source: "(11:2) ",
    		ctx
    	});

    	return block;
    }

    // (12:2) 
    function create_name_slot$2(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "aaaaa";
    			attr_dev(h3, "slot", "name");
    			attr_dev(h3, "class", "svelte-n76b4t");
    			add_location(h3, file$7, 11, 2, 206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_name_slot$2.name,
    		type: "slot",
    		source: "(12:2) ",
    		ctx
    	});

    	return block;
    }

    // (13:2) 
    function create_email_slot$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "ccc@aaaa.cccc";
    			attr_dev(div, "slot", "email");
    			add_location(div, file$7, 12, 2, 235);
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
    		id: create_email_slot$2.name,
    		type: "slot",
    		source: "(13:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let card0;
    	let t;
    	let card1;
    	let current;

    	card0 = new Card({
    			props: {
    				$$slots: {
    					email: [create_email_slot_1$2],
    					name: [create_name_slot_1$2],
    					age: [create_age_slot_1$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card1 = new Card({
    			props: {
    				$$slots: {
    					email: [create_email_slot$2],
    					name: [create_name_slot$2],
    					age: [create_age_slot$2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card0.$$.fragment);
    			t = space();
    			create_component(card1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(card1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				card0_changes.$$scope = { dirty, ctx };
    			}

    			card0.$set(card0_changes);
    			const card1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				card1_changes.$$scope = { dirty, ctx };
    			}

    			card1.$set(card1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card0.$$.fragment, local);
    			transition_in(card1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card0.$$.fragment, local);
    			transition_out(card1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(card1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example2', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example2> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Card });
    	return [];
    }

    class Example2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example2",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Example3.svelte generated by Svelte v3.59.2 */
    const file$6 = "src/Example3.svelte";

    // (6:2) 
    function create_age_slot_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "85";
    			attr_dev(div, "slot", "age");
    			add_location(div, file$6, 5, 2, 66);
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
    		id: create_age_slot_1.name,
    		type: "slot",
    		source: "(6:2) ",
    		ctx
    	});

    	return block;
    }

    // (7:2) 
    function create_name_slot_1$1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Heropy";
    			attr_dev(h2, "slot", "name");
    			add_location(h2, file$6, 6, 2, 93);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_name_slot_1$1.name,
    		type: "slot",
    		source: "(7:2) ",
    		ctx
    	});

    	return block;
    }

    // (9:2) 
    function create_email_slot_1$1(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*domain*/ ctx[0] + "";
    	let t1;
    	let t2;
    	let t3_value = /*hello*/ ctx[1] + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("dddd");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			attr_dev(div, "slot", "email");
    			add_location(div, file$6, 8, 2, 172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*domain*/ 1 && t1_value !== (t1_value = /*domain*/ ctx[0] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*hello*/ 2 && t3_value !== (t3_value = /*hello*/ ctx[1] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_email_slot_1$1.name,
    		type: "slot",
    		source: "(9:2) ",
    		ctx
    	});

    	return block;
    }

    // (12:2) 
    function create_age_slot$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "82";
    			attr_dev(div, "slot", "age");
    			add_location(div, file$6, 11, 2, 255);
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
    		id: create_age_slot$1.name,
    		type: "slot",
    		source: "(12:2) ",
    		ctx
    	});

    	return block;
    }

    // (13:2) 
    function create_name_slot$1(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "aaaaa";
    			attr_dev(h3, "slot", "name");
    			attr_dev(h3, "class", "svelte-n76b4t");
    			add_location(h3, file$6, 12, 2, 282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_name_slot$1.name,
    		type: "slot",
    		source: "(13:2) ",
    		ctx
    	});

    	return block;
    }

    // (14:2) 
    function create_email_slot$1(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*domain*/ ctx[0] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("fff");
    			t1 = text(t1_value);
    			attr_dev(div, "slot", "email");
    			add_location(div, file$6, 13, 2, 311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*domain*/ 1 && t1_value !== (t1_value = /*domain*/ ctx[0] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_email_slot$1.name,
    		type: "slot",
    		source: "(14:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let card0;
    	let t;
    	let card1;
    	let current;

    	card0 = new Card({
    			props: {
    				$$slots: {
    					email: [
    						create_email_slot_1$1,
    						({ hello, domain }) => ({ 1: hello, 0: domain }),
    						({ hello, domain }) => (hello ? 2 : 0) | (domain ? 1 : 0)
    					],
    					name: [create_name_slot_1$1],
    					age: [create_age_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card1 = new Card({
    			props: {
    				$$slots: {
    					email: [
    						create_email_slot$1,
    						({ domain }) => ({ 0: domain }),
    						({ domain }) => domain ? 1 : 0
    					],
    					name: [create_name_slot$1],
    					age: [create_age_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card0.$$.fragment);
    			t = space();
    			create_component(card1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(card1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card0_changes = {};

    			if (dirty & /*$$scope, hello, domain*/ 7) {
    				card0_changes.$$scope = { dirty, ctx };
    			}

    			card0.$set(card0_changes);
    			const card1_changes = {};

    			if (dirty & /*$$scope, domain*/ 5) {
    				card1_changes.$$scope = { dirty, ctx };
    			}

    			card1.$set(card1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card0.$$.fragment, local);
    			transition_in(card1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card0.$$.fragment, local);
    			transition_out(card1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(card1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example3', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example3> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Card });
    	return [];
    }

    class Example3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example3",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Wrap.svelte generated by Svelte v3.59.2 */

    const file$5 = "src/Wrap.svelte";
    const get_default_slot_changes = dirty => ({ _name: dirty & /*scopeName*/ 1 });
    const get_default_slot_context = ctx => ({ _name: /*scopeName*/ ctx[0] });

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$5, 4, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, scopeName*/ 3)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Wrap', slots, ['default']);
    	let { scopeName } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (scopeName === undefined && !('scopeName' in $$props || $$self.$$.bound[$$self.$$.props['scopeName']])) {
    			console.warn("<Wrap> was created without expected prop 'scopeName'");
    		}
    	});

    	const writable_props = ['scopeName'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Wrap> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('scopeName' in $$props) $$invalidate(0, scopeName = $$props.scopeName);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ scopeName });

    	$$self.$inject_state = $$props => {
    		if ('scopeName' in $$props) $$invalidate(0, scopeName = $$props.scopeName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scopeName, $$scope, slots];
    }

    class Wrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { scopeName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrap",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get scopeName() {
    		throw new Error("<Wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scopeName(value) {
    		throw new Error("<Wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example3-1.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$4 = "src/Example3-1.svelte";

    // (48:0) <Wrap   scopeName="apple"   let:_name >
    function create_default_slot_1(ctx) {
    	let label;
    	let input;
    	let input_readonly_value;
    	let input_disabled_value;
    	let input_placeholder_value;
    	let label_class_value;
    	let label_name_value;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[3].call(input, /*_name*/ ctx[7]);
    	}

    	function change_handler_1() {
    		return /*change_handler_1*/ ctx[4](/*_name*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			input.readOnly = input_readonly_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.readonly;
    			input.disabled = input_disabled_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.disabled;
    			attr_dev(input, "placeholder", input_placeholder_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.placeholder);
    			add_location(input, file$4, 54, 4, 972);
    			attr_dev(label, "class", label_class_value = "fruits_" + /*_name*/ ctx[7]);
    			attr_dev(label, "name", label_name_value = /*_name*/ ctx[7]);
    			add_location(label, file$4, 51, 2, 914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			set_input_value(input, /*fruits*/ ctx[0][/*_name*/ ctx[7]].value);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler_1),
    					listen_dev(input, "change", change_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*fruits, _name*/ 129 && input_readonly_value !== (input_readonly_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.readonly)) {
    				prop_dev(input, "readOnly", input_readonly_value);
    			}

    			if (dirty & /*fruits, _name*/ 129 && input_disabled_value !== (input_disabled_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.disabled)) {
    				prop_dev(input, "disabled", input_disabled_value);
    			}

    			if (dirty & /*fruits, _name*/ 129 && input_placeholder_value !== (input_placeholder_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.placeholder)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*fruits, _name*/ 129 && input.value !== /*fruits*/ ctx[0][/*_name*/ ctx[7]].value) {
    				set_input_value(input, /*fruits*/ ctx[0][/*_name*/ ctx[7]].value);
    			}

    			if (dirty & /*_name*/ 128 && label_class_value !== (label_class_value = "fruits_" + /*_name*/ ctx[7])) {
    				attr_dev(label, "class", label_class_value);
    			}

    			if (dirty & /*_name*/ 128 && label_name_value !== (label_name_value = /*_name*/ ctx[7])) {
    				attr_dev(label, "name", label_name_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(48:0) <Wrap   scopeName=\\\"apple\\\"   let:_name >",
    		ctx
    	});

    	return block;
    }

    // (66:0) <Wrap   scopeName="banana"   let:_name >
    function create_default_slot$2(ctx) {
    	let input;
    	let input_disabled_value;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	function input_input_handler_2() {
    		/*input_input_handler_2*/ ctx[5].call(input, /*_name*/ ctx[7]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*_name*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			input.disabled = input_disabled_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.disabled;
    			attr_dev(input, "placeholder", input_placeholder_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.placeholder);
    			add_location(input, file$4, 69, 4, 1279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*fruits*/ ctx[0][/*_name*/ ctx[7]].value);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler_2),
    					listen_dev(input, "click", click_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*fruits, _name*/ 129 && input_disabled_value !== (input_disabled_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.disabled)) {
    				prop_dev(input, "disabled", input_disabled_value);
    			}

    			if (dirty & /*fruits, _name*/ 129 && input_placeholder_value !== (input_placeholder_value = /*fruits*/ ctx[0][/*_name*/ ctx[7]].options.placeholder)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*fruits, _name*/ 129 && input.value !== /*fruits*/ ctx[0][/*_name*/ ctx[7]].value) {
    				set_input_value(input, /*fruits*/ ctx[0][/*_name*/ ctx[7]].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(66:0) <Wrap   scopeName=\\\"banana\\\"   let:_name >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let label;
    	let input;
    	let input_readonly_value;
    	let input_disabled_value;
    	let input_placeholder_value;
    	let t0;
    	let wrap0;
    	let t1;
    	let wrap1;
    	let current;
    	let mounted;
    	let dispose;

    	wrap0 = new Wrap({
    			props: {
    				scopeName: "apple",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ _name }) => ({ 7: _name }),
    						({ _name }) => _name ? 128 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	wrap1 = new Wrap({
    			props: {
    				scopeName: "banana",
    				$$slots: {
    					default: [
    						create_default_slot$2,
    						({ _name }) => ({ 7: _name }),
    						({ _name }) => _name ? 128 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			create_component(wrap0.$$.fragment);
    			t1 = space();
    			create_component(wrap1.$$.fragment);
    			input.readOnly = input_readonly_value = /*fruits*/ ctx[0].apple.options.readonly;
    			input.disabled = input_disabled_value = /*fruits*/ ctx[0].apple.options.disabled;
    			attr_dev(input, "placeholder", input_placeholder_value = /*fruits*/ ctx[0].apple.options.placeholder);
    			add_location(input, file$4, 36, 2, 563);
    			attr_dev(label, "class", "fruits_apple");
    			attr_dev(label, "name", "appple");
    			add_location(label, file$4, 33, 0, 514);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			set_input_value(input, /*fruits*/ ctx[0].apple.value);
    			insert_dev(target, t0, anchor);
    			mount_component(wrap0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(wrap1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[1]),
    					listen_dev(input, "change", /*change_handler*/ ctx[2], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*fruits*/ 1 && input_readonly_value !== (input_readonly_value = /*fruits*/ ctx[0].apple.options.readonly)) {
    				prop_dev(input, "readOnly", input_readonly_value);
    			}

    			if (!current || dirty & /*fruits*/ 1 && input_disabled_value !== (input_disabled_value = /*fruits*/ ctx[0].apple.options.disabled)) {
    				prop_dev(input, "disabled", input_disabled_value);
    			}

    			if (!current || dirty & /*fruits*/ 1 && input_placeholder_value !== (input_placeholder_value = /*fruits*/ ctx[0].apple.options.placeholder)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*fruits*/ 1 && input.value !== /*fruits*/ ctx[0].apple.value) {
    				set_input_value(input, /*fruits*/ ctx[0].apple.value);
    			}

    			const wrap0_changes = {};

    			if (dirty & /*$$scope, _name, fruits*/ 385) {
    				wrap0_changes.$$scope = { dirty, ctx };
    			}

    			wrap0.$set(wrap0_changes);
    			const wrap1_changes = {};

    			if (dirty & /*$$scope, fruits, _name*/ 385) {
    				wrap1_changes.$$scope = { dirty, ctx };
    			}

    			wrap1.$set(wrap1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wrap0.$$.fragment, local);
    			transition_in(wrap1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wrap0.$$.fragment, local);
    			transition_out(wrap1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t0);
    			destroy_component(wrap0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(wrap1, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function add(name) {
    	console.log(name);
    }

    function update(name) {
    	console.log(name);
    }

    function remove(name) {
    	console.log(name);
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example3_1', slots, []);

    	let fruits = {
    		apple: {
    			value: '',
    			options: {
    				readonly: false,
    				disabled: false,
    				placeholder: 'placeholder A'
    			}
    		},
    		banana: {
    			value: 'banana',
    			options: {
    				disabled: false,
    				placeholder: 'placeholder A'
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Example3_1> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		fruits.apple.value = this.value;
    		$$invalidate(0, fruits);
    	}

    	const change_handler = () => add('apple');

    	function input_input_handler_1(_name) {
    		fruits[_name].value = this.value;
    		$$invalidate(0, fruits);
    	}

    	const change_handler_1 = _name => add(_name);

    	function input_input_handler_2(_name) {
    		fruits[_name].value = this.value;
    		$$invalidate(0, fruits);
    	}

    	const click_handler = _name => update(_name);
    	$$self.$capture_state = () => ({ Wrap, fruits, add, update, remove });

    	$$self.$inject_state = $$props => {
    		if ('fruits' in $$props) $$invalidate(0, fruits = $$props.fruits);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fruits,
    		input_input_handler,
    		change_handler,
    		input_input_handler_1,
    		change_handler_1,
    		input_input_handler_2,
    		click_handler
    	];
    }

    class Example3_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example3_1",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Child.svelte generated by Svelte v3.59.2 */
    const get_named_child_slot_changes = dirty => ({});
    const get_named_child_slot_context = ctx => ({});
    const get_scoped_child_slot_changes = dirty => ({});
    const get_scoped_child_slot_context = ctx => ({ scoped: /*scoped*/ ctx[0] });

    function create_fragment$5(ctx) {
    	let t0;
    	let t1;
    	let current;
    	const scoped_child_slot_template = /*#slots*/ ctx[2]["scoped-child"];
    	const scoped_child_slot = create_slot(scoped_child_slot_template, ctx, /*$$scope*/ ctx[1], get_scoped_child_slot_context);
    	const named_child_slot_template = /*#slots*/ ctx[2]["named-child"];
    	const named_child_slot = create_slot(named_child_slot_template, ctx, /*$$scope*/ ctx[1], get_named_child_slot_context);
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			if (scoped_child_slot) scoped_child_slot.c();
    			t0 = space();
    			if (named_child_slot) named_child_slot.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (scoped_child_slot) {
    				scoped_child_slot.m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);

    			if (named_child_slot) {
    				named_child_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (scoped_child_slot) {
    				if (scoped_child_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						scoped_child_slot,
    						scoped_child_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(scoped_child_slot_template, /*$$scope*/ ctx[1], dirty, get_scoped_child_slot_changes),
    						get_scoped_child_slot_context
    					);
    				}
    			}

    			if (named_child_slot) {
    				if (named_child_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						named_child_slot,
    						named_child_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(named_child_slot_template, /*$$scope*/ ctx[1], dirty, get_named_child_slot_changes),
    						get_named_child_slot_context
    					);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scoped_child_slot, local);
    			transition_in(named_child_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scoped_child_slot, local);
    			transition_out(named_child_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (scoped_child_slot) scoped_child_slot.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (named_child_slot) named_child_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots('Child', slots, ['scoped-child','named-child','default']);
    	let scoped = "Scoped!!";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Child> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ scoped });

    	$$self.$inject_state = $$props => {
    		if ('scoped' in $$props) $$invalidate(0, scoped = $$props.scoped);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scoped, $$scope, slots];
    }

    class Child extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Child",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Parent.svelte generated by Svelte v3.59.2 */
    const get_named_slot_changes = dirty => ({});
    const get_named_slot_context = ctx => ({ slot: "named-child" });
    const get_scoped_slot_changes = dirty => ({ scoped: dirty & /*scoped*/ 4 });

    const get_scoped_slot_context = ctx => ({
    	slot: "scoped-child",
    	scoped: /*scoped*/ ctx[2]
    });

    // (6:0) <Child let:scoped>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[0].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(6:0) <Child let:scoped>",
    		ctx
    	});

    	return block;
    }

    // (8:2) 
    function create_named_child_slot(ctx) {
    	let current;
    	const named_slot_template = /*#slots*/ ctx[0].named;
    	const named_slot = create_slot(named_slot_template, ctx, /*$$scope*/ ctx[1], get_named_slot_context);

    	const block = {
    		c: function create() {
    			if (named_slot) named_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (named_slot) {
    				named_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (named_slot) {
    				if (named_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						named_slot,
    						named_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(named_slot_template, /*$$scope*/ ctx[1], dirty, get_named_slot_changes),
    						get_named_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(named_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(named_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (named_slot) named_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_named_child_slot.name,
    		type: "slot",
    		source: "(8:2) ",
    		ctx
    	});

    	return block;
    }

    // (9:2) 
    function create_scoped_child_slot(ctx) {
    	let current;
    	const scoped_slot_template = /*#slots*/ ctx[0].scoped;
    	const scoped_slot = create_slot(scoped_slot_template, ctx, /*$$scope*/ ctx[1], get_scoped_slot_context);

    	const block = {
    		c: function create() {
    			if (scoped_slot) scoped_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (scoped_slot) {
    				scoped_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (scoped_slot) {
    				if (scoped_slot.p && (!current || dirty & /*$$scope, scoped*/ 6)) {
    					update_slot_base(
    						scoped_slot,
    						scoped_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(scoped_slot_template, /*$$scope*/ ctx[1], dirty, get_scoped_slot_changes),
    						get_scoped_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scoped_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scoped_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (scoped_slot) scoped_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_scoped_child_slot.name,
    		type: "slot",
    		source: "(9:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let child;
    	let current;

    	child = new Child({
    			props: {
    				$$slots: {
    					"scoped-child": [
    						create_scoped_child_slot,
    						({ scoped }) => ({ 2: scoped }),
    						({ scoped }) => scoped ? 4 : 0
    					],
    					"named-child": [
    						create_named_child_slot,
    						({ scoped }) => ({ 2: scoped }),
    						({ scoped }) => scoped ? 4 : 0
    					],
    					default: [
    						create_default_slot$1,
    						({ scoped }) => ({ 2: scoped }),
    						({ scoped }) => scoped ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(child.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(child, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const child_changes = {};

    			if (dirty & /*$$scope, scoped*/ 6) {
    				child_changes.$$scope = { dirty, ctx };
    			}

    			child.$set(child_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(child.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(child.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(child, detaching);
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
    	validate_slots('Parent', slots, ['scoped','named','default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Parent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Child });
    	return [slots, $$scope];
    }

    class Parent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Parent",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Example4.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/Example4.svelte";

    // (6:0) <Parent let:scoped>
    function create_default_slot(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Default slot..";
    			add_location(h2, file$3, 6, 2, 84);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(6:0) <Parent let:scoped>",
    		ctx
    	});

    	return block;
    }

    // (8:2) 
    function create_named_slot(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Named slot..";
    			attr_dev(h3, "slot", "named");
    			add_location(h3, file$3, 7, 2, 110);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_named_slot.name,
    		type: "slot",
    		source: "(8:2) ",
    		ctx
    	});

    	return block;
    }

    // (9:2) 
    function create_scoped_slot(ctx) {
    	let h1;
    	let t0;
    	let t1_value = /*scoped*/ ctx[0] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Scoped slot..");
    			t1 = text(t1_value);
    			attr_dev(h1, "slot", "scoped");
    			add_location(h1, file$3, 8, 2, 147);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*scoped*/ 1 && t1_value !== (t1_value = /*scoped*/ ctx[0] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_scoped_slot.name,
    		type: "slot",
    		source: "(9:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let parent;
    	let current;

    	parent = new Parent({
    			props: {
    				$$slots: {
    					scoped: [
    						create_scoped_slot,
    						({ scoped }) => ({ 0: scoped }),
    						({ scoped }) => scoped ? 1 : 0
    					],
    					named: [
    						create_named_slot,
    						({ scoped }) => ({ 0: scoped }),
    						({ scoped }) => scoped ? 1 : 0
    					],
    					default: [
    						create_default_slot,
    						({ scoped }) => ({ 0: scoped }),
    						({ scoped }) => scoped ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parent.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(parent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const parent_changes = {};

    			if (dirty & /*$$scope, scoped*/ 3) {
    				parent_changes.$$scope = { dirty, ctx };
    			}

    			parent.$set(parent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parent, detaching);
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
    	validate_slots('Example4', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example4> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Parent });
    	return [];
    }

    class Example4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example4",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/UserCard.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$2 = "src/UserCard.svelte";
    const get_email_slot_changes = dirty => ({});
    const get_email_slot_context = ctx => ({});
    const get_age_slot_changes = dirty => ({});
    const get_age_slot_context = ctx => ({});
    const get_name_slot_changes = dirty => ({});
    const get_name_slot_context = ctx => ({});

    // (8:2) {#if $$slots.age}
    function create_if_block_1(ctx) {
    	let hr;
    	let t;
    	let current;
    	const age_slot_template = /*#slots*/ ctx[2].age;
    	const age_slot = create_slot(age_slot_template, ctx, /*$$scope*/ ctx[1], get_age_slot_context);

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t = space();
    			if (age_slot) age_slot.c();
    			add_location(hr, file$2, 8, 4, 182);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t, anchor);

    			if (age_slot) {
    				age_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (age_slot) {
    				if (age_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						age_slot,
    						age_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(age_slot_template, /*$$scope*/ ctx[1], dirty, get_age_slot_changes),
    						get_age_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(age_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(age_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t);
    			if (age_slot) age_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(8:2) {#if $$slots.age}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#if $$slots.email}
    function create_if_block(ctx) {
    	let hr;
    	let t;
    	let current;
    	const email_slot_template = /*#slots*/ ctx[2].email;
    	const email_slot = create_slot(email_slot_template, ctx, /*$$scope*/ ctx[1], get_email_slot_context);

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t = space();
    			if (email_slot) email_slot.c();
    			add_location(hr, file$2, 12, 4, 252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t, anchor);

    			if (email_slot) {
    				email_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (email_slot) {
    				if (email_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						email_slot,
    						email_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(email_slot_template, /*$$scope*/ ctx[1], dirty, get_email_slot_changes),
    						get_email_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(email_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(email_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t);
    			if (email_slot) email_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(12:2) {#if $$slots.email}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	const name_slot_template = /*#slots*/ ctx[2].name;
    	const name_slot = create_slot(name_slot_template, ctx, /*$$scope*/ ctx[1], get_name_slot_context);
    	let if_block0 = /*$$slots*/ ctx[0].age && create_if_block_1(ctx);
    	let if_block1 = /*$$slots*/ ctx[0].email && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (name_slot) name_slot.c();
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "user-card svelte-1346ujo");
    			add_location(div, file$2, 5, 0, 106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (name_slot) {
    				name_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (name_slot) {
    				if (name_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						name_slot,
    						name_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(name_slot_template, /*$$scope*/ ctx[1], dirty, get_name_slot_changes),
    						get_name_slot_context
    					);
    				}
    			}

    			if (/*$$slots*/ ctx[0].age) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$$slots*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$$slots*/ ctx[0].email) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$$slots*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(name_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(name_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (name_slot) name_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
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
    	validate_slots('UserCard', slots, ['name','age','email']);
    	const $$slots = compute_slots(slots);
    	console.log($$slots);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<UserCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [$$slots, $$scope, slots];
    }

    class UserCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserCard",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Example5.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/Example5.svelte";

    // (6:2) 
    function create_name_slot_2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "HEROPY";
    			attr_dev(h2, "slot", "name");
    			add_location(h2, file$1, 5, 2, 78);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_name_slot_2.name,
    		type: "slot",
    		source: "(6:2) ",
    		ctx
    	});

    	return block;
    }

    // (7:2) 
    function create_age_slot(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "11";
    			attr_dev(h3, "slot", "age");
    			add_location(h3, file$1, 6, 2, 108);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_age_slot.name,
    		type: "slot",
    		source: "(7:2) ",
    		ctx
    	});

    	return block;
    }

    // (8:2) 
    function create_email_slot_1(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "aaa@aaa.ccc";
    			attr_dev(h3, "slot", "email");
    			add_location(h3, file$1, 7, 2, 133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_email_slot_1.name,
    		type: "slot",
    		source: "(8:2) ",
    		ctx
    	});

    	return block;
    }

    // (13:2) 
    function create_name_slot_1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "NEO";
    			attr_dev(h2, "slot", "name");
    			add_location(h2, file$1, 12, 2, 194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_name_slot_1.name,
    		type: "slot",
    		source: "(13:2) ",
    		ctx
    	});

    	return block;
    }

    // (14:2) 
    function create_email_slot(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "neo@aaa.ccc";
    			attr_dev(h3, "slot", "email");
    			add_location(h3, file$1, 13, 2, 221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_email_slot.name,
    		type: "slot",
    		source: "(14:2) ",
    		ctx
    	});

    	return block;
    }

    // (18:2) 
    function create_name_slot(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Evan";
    			attr_dev(h2, "slot", "name");
    			add_location(h2, file$1, 17, 2, 281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_name_slot.name,
    		type: "slot",
    		source: "(18:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let usercard0;
    	let t0;
    	let usercard1;
    	let t1;
    	let usercard2;
    	let current;

    	usercard0 = new UserCard({
    			props: {
    				$$slots: {
    					email: [create_email_slot_1],
    					age: [create_age_slot],
    					name: [create_name_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	usercard1 = new UserCard({
    			props: {
    				$$slots: {
    					email: [create_email_slot],
    					name: [create_name_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	usercard2 = new UserCard({
    			props: {
    				$$slots: { name: [create_name_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(usercard0.$$.fragment);
    			t0 = space();
    			create_component(usercard1.$$.fragment);
    			t1 = space();
    			create_component(usercard2.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(usercard0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(usercard1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(usercard2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const usercard0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				usercard0_changes.$$scope = { dirty, ctx };
    			}

    			usercard0.$set(usercard0_changes);
    			const usercard1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				usercard1_changes.$$scope = { dirty, ctx };
    			}

    			usercard1.$set(usercard1_changes);
    			const usercard2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				usercard2_changes.$$scope = { dirty, ctx };
    			}

    			usercard2.$set(usercard2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(usercard0.$$.fragment, local);
    			transition_in(usercard1.$$.fragment, local);
    			transition_in(usercard2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(usercard0.$$.fragment, local);
    			transition_out(usercard1.$$.fragment, local);
    			transition_out(usercard2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(usercard0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(usercard1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(usercard2, detaching);
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
    	validate_slots('Example5', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example5> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ UserCard });
    	return [];
    }

    class Example5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example5",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let h10;
    	let t1;
    	let h11;
    	let t3;
    	let h12;
    	let t5;
    	let h13;
    	let t7;
    	let h14;
    	let t9;
    	let example5;
    	let current;
    	example5 = new Example5({ $$inline: true });

    	const block = {
    		c: function create() {
    			h10 = element("h1");
    			h10.textContent = "1. 단일 슬롯과 Fallback content";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = "2. 이름을 가지는 슬롯";
    			t3 = space();
    			h12 = element("h1");
    			h12.textContent = "3. 범위를 가지는 슬롯(Props)";
    			t5 = space();
    			h13 = element("h1");
    			h13.textContent = "4. 슬롯 포워딩(Forwarding)";
    			t7 = space();
    			h14 = element("h1");
    			h14.textContent = "5. $$slots";
    			t9 = space();
    			create_component(example5.$$.fragment);
    			add_location(h10, file, 9, 0, 283);
    			add_location(h11, file, 12, 0, 344);
    			add_location(h12, file, 15, 0, 392);
    			add_location(h13, file, 19, 0, 471);
    			add_location(h14, file, 22, 0, 527);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h12, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h13, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h14, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(example5, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(example5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(example5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h12);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h13);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h14);
    			if (detaching) detach_dev(t9);
    			destroy_component(example5, detaching);
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

    	$$self.$capture_state = () => ({
    		Example1,
    		Example2,
    		Example3,
    		Example3_1,
    		Example4,
    		Example5
    	});

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
