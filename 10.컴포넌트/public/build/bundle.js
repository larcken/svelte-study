
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
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
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
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

    /* src/Heropy.svelte generated by Svelte v3.59.2 */

    const file$j = "src/Heropy.svelte";

    function create_fragment$p(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let t3;
    	let div1;
    	let t5;
    	let div2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = `${/*name*/ ctx[1]}`;
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = `${/*age*/ ctx[2]}`;
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = `${/*email*/ ctx[3]}`;
    			add_location(h2, file$j, 8, 0, 116);
    			add_location(div0, file$j, 9, 0, 133);
    			add_location(div1, file$j, 10, 0, 151);
    			add_location(div2, file$j, 11, 0, 168);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Heropy', slots, []);
    	let { title = 'Title' } = $$props;
    	let name = 'Heropy';
    	let age = 25;
    	let email = 'aaa@abcd.com';
    	const writable_props = ['title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Heropy> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ title, name, age, email });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('age' in $$props) $$invalidate(2, age = $$props.age);
    		if ('email' in $$props) $$invalidate(3, email = $$props.email);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, name, age, email];
    }

    let Heropy$1 = class Heropy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Heropy",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get title() {
    		throw new Error("<Heropy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Heropy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    };

    /* src/Footer.svelte generated by Svelte v3.59.2 */

    function create_fragment$o(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("footer");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/Example1.svelte generated by Svelte v3.59.2 */

    const { console: console_1$5 } = globals;

    function create_fragment$n(ctx) {
    	let heropy_1;
    	let t;
    	let footer;
    	let current;
    	let heropy_1_props = { title: "aaa" };
    	heropy_1 = new Heropy$1({ props: heropy_1_props, $$inline: true });
    	/*heropy_1_binding*/ ctx[1](heropy_1);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(heropy_1.$$.fragment);
    			t = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(heropy_1, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const heropy_1_changes = {};
    			heropy_1.$set(heropy_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(heropy_1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(heropy_1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*heropy_1_binding*/ ctx[1](null);
    			destroy_component(heropy_1, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example1', slots, []);
    	let heropy;

    	onMount(() => {
    		console.log(heropy);

    		// title은 Heropy 컴포넌트의 title 속성. 직접 접근은 막고 있음
    		// <svelte:options accessors/> 을 통해서 접근하도록 되어있음
    		console.log(heropy.title);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<Example1> was created with unknown prop '${key}'`);
    	});

    	function heropy_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			heropy = $$value;
    			$$invalidate(0, heropy);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, Heropy: Heropy$1, Footer, heropy });

    	$$self.$inject_state = $$props => {
    		if ('heropy' in $$props) $$invalidate(0, heropy = $$props.heropy);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [heropy, heropy_1_binding];
    }

    class Example1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example1",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/User.svelte generated by Svelte v3.59.2 */

    const file$i = "src/User.svelte";

    function create_fragment$m(ctx) {
    	let ul;
    	let li0;
    	let t0;
    	let t1;
    	let li1;
    	let t2;
    	let t3;
    	let li2;
    	let t4;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			li1 = element("li");
    			t2 = text(/*age*/ ctx[1]);
    			t3 = space();
    			li2 = element("li");
    			t4 = text(/*email*/ ctx[2]);
    			add_location(li0, file$i, 7, 2, 101);
    			add_location(li1, file$i, 8, 2, 119);
    			add_location(li2, file$i, 9, 2, 136);
    			add_location(ul, file$i, 6, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (dirty & /*age*/ 2) set_data_dev(t2, /*age*/ ctx[1]);
    			if (dirty & /*email*/ 4) set_data_dev(t4, /*email*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('User', slots, []);
    	let { name = '' } = $$props;
    	let { age } = $$props;
    	let { email = 'None...' } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (age === undefined && !('age' in $$props || $$self.$$.bound[$$self.$$.props['age']])) {
    			console.warn("<User> was created without expected prop 'age'");
    		}
    	});

    	const writable_props = ['name', 'age', 'email'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<User> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('age' in $$props) $$invalidate(1, age = $$props.age);
    		if ('email' in $$props) $$invalidate(2, email = $$props.email);
    	};

    	$$self.$capture_state = () => ({ name, age, email });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('age' in $$props) $$invalidate(1, age = $$props.age);
    		if ('email' in $$props) $$invalidate(2, email = $$props.email);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, age, email];
    }

    class User extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { name: 0, age: 1, email: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get name() {
    		throw new Error("<User>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<User>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get age() {
    		throw new Error("<User>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set age(value) {
    		throw new Error("<User>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get email() {
    		throw new Error("<User>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<User>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example2.svelte generated by Svelte v3.59.2 */
    const file$h = "src/Example2.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i].name;
    	child_ctx[5] = list[i].age;
    	child_ctx[6] = list[i].email;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (25:2) {#each users as user}
    function create_each_block_2(ctx) {
    	let user;
    	let current;

    	user = new User({
    			props: {
    				name: /*user*/ ctx[1].name,
    				age: /*user*/ ctx[1].age,
    				email: /*user*/ ctx[1].email
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(user.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(user, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(user.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(user.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(user, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(25:2) {#each users as user}",
    		ctx
    	});

    	return block;
    }

    // (36:2) {#each users as {name, age, email}}
    function create_each_block_1(ctx) {
    	let user;
    	let current;

    	user = new User({
    			props: {
    				name: /*name*/ ctx[4],
    				age: /*age*/ ctx[5],
    				email: /*email*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(user.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(user, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(user.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(user.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(user, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(36:2) {#each users as {name, age, email}}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#each users as user}
    function create_each_block$4(ctx) {
    	let user;
    	let current;
    	const user_spread_levels = [/*user*/ ctx[1]];
    	let user_props = {};

    	for (let i = 0; i < user_spread_levels.length; i += 1) {
    		user_props = assign(user_props, user_spread_levels[i]);
    	}

    	user = new User({ props: user_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(user.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(user, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const user_changes = (dirty & /*users*/ 1)
    			? get_spread_update(user_spread_levels, [get_spread_object(/*user*/ ctx[1])])
    			: {};

    			user.$set(user_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(user.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(user.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(user, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(43:2) {#each users as user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let section0;
    	let t0;
    	let section1;
    	let t1;
    	let section2;
    	let current;
    	let each_value_2 = /*users*/ ctx[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*users*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section0 = element("section");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t0 = space();
    			section1 = element("section");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			section2 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(section0, file$h, 23, 0, 276);
    			add_location(section1, file$h, 34, 0, 467);
    			add_location(section2, file$h, 41, 0, 616);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(section0, null);
    				}
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, section1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(section1, null);
    				}
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, section2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(section2, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*users*/ 1) {
    				each_value_2 = /*users*/ ctx[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(section0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*users*/ 1) {
    				each_value_1 = /*users*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(section1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*users*/ 1) {
    				each_value = /*users*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example2', slots, []);

    	let users = [
    		{
    			name: 'Neo',
    			age: 20,
    			email: 'neo@abc.com'
    		},
    		{
    			name: 'Levis',
    			age: 25,
    			email: 'levis@abc.com'
    		},
    		{ name: 'Evan', age: 30 }
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example2> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ User, users });

    	$$self.$inject_state = $$props => {
    		if ('users' in $$props) $$invalidate(0, users = $$props.users);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [users];
    }

    class Example2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example2",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/Todo.svelte generated by Svelte v3.59.2 */

    const { console: console_1$4 } = globals;
    const file$g = "src/Todo.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let input;
    	let t0;
    	let t1_value = /*todo*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			button.textContent = "X";
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$g, 17, 2, 298);
    			add_location(button, file$g, 19, 2, 365);
    			add_location(div, file$g, 16, 0, 290);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*todo*/ ctx[0].done);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[4]),
    					listen_dev(button, "click", /*deleteTodo*/ ctx[1], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todo*/ 1) {
    				set_input_value(input, /*todo*/ ctx[0].done);
    			}

    			if (dirty & /*todo*/ 1 && t1_value !== (t1_value = /*todo*/ ctx[0].title + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Todo', slots, []);
    	let { todo } = $$props;
    	let { todos } = $$props;
    	let { index } = $$props;

    	function deleteTodo() {
    		// todos는 부모 컴포넌트에 있어서 사용할 수 없다. 예전 예제에서 store를 사용해서 비슷한 예제를 했었는데 더 쉬운 방법이 있다.
    		// 그것이 양방향 데이터 바인딩
    		todos.splice(index, 1);

    		$$invalidate(2, todos);
    		console.log(todos);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (todo === undefined && !('todo' in $$props || $$self.$$.bound[$$self.$$.props['todo']])) {
    			console_1$4.warn("<Todo> was created without expected prop 'todo'");
    		}

    		if (todos === undefined && !('todos' in $$props || $$self.$$.bound[$$self.$$.props['todos']])) {
    			console_1$4.warn("<Todo> was created without expected prop 'todos'");
    		}

    		if (index === undefined && !('index' in $$props || $$self.$$.bound[$$self.$$.props['index']])) {
    			console_1$4.warn("<Todo> was created without expected prop 'index'");
    		}
    	});

    	const writable_props = ['todo', 'todos', 'index'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		todo.done = this.value;
    		$$invalidate(0, todo);
    	}

    	$$self.$$set = $$props => {
    		if ('todo' in $$props) $$invalidate(0, todo = $$props.todo);
    		if ('todos' in $$props) $$invalidate(2, todos = $$props.todos);
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({ todo, todos, index, deleteTodo });

    	$$self.$inject_state = $$props => {
    		if ('todo' in $$props) $$invalidate(0, todo = $$props.todo);
    		if ('todos' in $$props) $$invalidate(2, todos = $$props.todos);
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todo, deleteTodo, todos, index, input_change_handler];
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { todo: 0, todos: 2, index: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get todo() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get todos() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todos(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example3.svelte generated by Svelte v3.59.2 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (11:0) {#each todos as todo, index (todo.id) }
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let todo;
    	let updating_todos;
    	let t;
    	let current;

    	function todo_todos_binding(value) {
    		/*todo_todos_binding*/ ctx[1](value);
    	}

    	let todo_props = {
    		todo: /*todo*/ ctx[2],
    		index: /*index*/ ctx[4]
    	};

    	if (/*todos*/ ctx[0] !== void 0) {
    		todo_props.todos = /*todos*/ ctx[0];
    	}

    	todo = new Todo({ props: todo_props, $$inline: true });
    	binding_callbacks.push(() => bind(todo, 'todos', todo_todos_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(todo.$$.fragment);
    			t = space();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(todo, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const todo_changes = {};
    			if (dirty & /*todos*/ 1) todo_changes.todo = /*todo*/ ctx[2];
    			if (dirty & /*todos*/ 1) todo_changes.index = /*index*/ ctx[4];

    			if (!updating_todos && dirty & /*todos*/ 1) {
    				updating_todos = true;
    				todo_changes.todos = /*todos*/ ctx[0];
    				add_flush_callback(() => updating_todos = false);
    			}

    			todo.$set(todo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(todo, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(11:0) {#each todos as todo, index (todo.id) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*todos*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*todo*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todos*/ 1) {
    				each_value = /*todos*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example3', slots, []);

    	let todos = [
    		{ id: 1, title: 'Breakfast', done: false },
    		{ id: 2, title: 'Lunch', done: false },
    		{ id: 3, title: 'Dinner', done: false }
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example3> was created with unknown prop '${key}'`);
    	});

    	function todo_todos_binding(value) {
    		todos = value;
    		$$invalidate(0, todos);
    	}

    	$$self.$capture_state = () => ({ Todo, todos });

    	$$self.$inject_state = $$props => {
    		if ('todos' in $$props) $$invalidate(0, todos = $$props.todos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todos, todo_todos_binding];
    }

    class Example3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example3",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/Todo_Example4.svelte generated by Svelte v3.59.2 */
    const file$f = "src/Todo_Example4.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let input;
    	let t0;
    	let t1_value = /*todo*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			button.textContent = "X";
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$f, 21, 2, 445);
    			add_location(button, file$f, 23, 2, 512);
    			add_location(div, file$f, 20, 0, 437);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*todo*/ ctx[0].done);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[2]),
    					listen_dev(button, "click", /*deleteTodo*/ ctx[1], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todo*/ 1) {
    				set_input_value(input, /*todo*/ ctx[0].done);
    			}

    			if (dirty & /*todo*/ 1 && t1_value !== (t1_value = /*todo*/ ctx[0].title + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Todo_Example4', slots, []);
    	let { todo } = $$props;
    	const dispatch = createEventDispatcher();

    	function deleteTodo() {
    		// delete 버튼을 클릭하면 부모 컴포넌트에게 todos에 선택된 항목이 삭제되도록 요청만 하는걸로 진행
    		// custom event 이름 명기
    		// dispatch('deleteMe', todo.id)
    		// dispatch를 여러개 사용한다면 이 처럼 객체형태로 detail을 넘겨주는게 좋다.
    		// 부모에서도 관련부분 적용되도록 수정
    		dispatch('deleteMe', { todoId: todo.id });
    	}

    	$$self.$$.on_mount.push(function () {
    		if (todo === undefined && !('todo' in $$props || $$self.$$.bound[$$self.$$.props['todo']])) {
    			console.warn("<Todo_Example4> was created without expected prop 'todo'");
    		}
    	});

    	const writable_props = ['todo'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Todo_Example4> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		todo.done = this.value;
    		$$invalidate(0, todo);
    	}

    	$$self.$$set = $$props => {
    		if ('todo' in $$props) $$invalidate(0, todo = $$props.todo);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		todo,
    		dispatch,
    		deleteTodo
    	});

    	$$self.$inject_state = $$props => {
    		if ('todo' in $$props) $$invalidate(0, todo = $$props.todo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todo, deleteTodo, input_change_handler];
    }

    class Todo_Example4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { todo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo_Example4",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get todo() {
    		throw new Error("<Todo_Example4>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<Todo_Example4>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example4.svelte generated by Svelte v3.59.2 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (24:0) {#each todos as todo(todo.id) }
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let todo;
    	let current;

    	todo = new Todo_Example4({
    			props: { todo: /*todo*/ ctx[2] },
    			$$inline: true
    		});

    	todo.$on("deleteMe", /*deleteTodo*/ ctx[1]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(todo.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(todo, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const todo_changes = {};
    			if (dirty & /*todos*/ 1) todo_changes.todo = /*todo*/ ctx[2];
    			todo.$set(todo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(todo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(24:0) {#each todos as todo(todo.id) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*todos*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*todo*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todos, deleteTodo*/ 3) {
    				each_value = /*todos*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$2, each_1_anchor, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example4', slots, []);

    	let todos = [
    		{ id: 1, title: 'Breakfast', done: false },
    		{ id: 2, title: 'Lunch', done: false },
    		{ id: 3, title: 'Dinner', done: false }
    	];

    	function deleteTodo(event) {
    		// createEventDispatcher 함수에서 new CustomEvent()를 통해 커스텀 이벤트를 생성
    		// 따라서 event.detail을 사용할 수 있음
    		// console.log(event.detail)
    		// const todoId = event.detail;
    		const todoId = event.detail.todoId;

    		const index = todos.findIndex(t => t.id === todoId);
    		todos.splice(index, 1);
    		$$invalidate(0, todos);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example4> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Todo: Todo_Example4, todos, deleteTodo });

    	$$self.$inject_state = $$props => {
    		if ('todos' in $$props) $$invalidate(0, todos = $$props.todos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todos, deleteTodo];
    }

    class Example4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example4",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/Child.svelte generated by Svelte v3.59.2 */
    const file$e = "src/Child.svelte";

    function create_fragment$g(ctx) {
    	let h2;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Child!";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Child click!";
    			add_location(h2, file$e, 5, 0, 110);
    			add_location(button, file$e, 6, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Child', slots, []);
    	const dispatch = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Child> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch('myEvent', { myName: 'Heropy!' });
    	};

    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch });
    	return [dispatch, click_handler];
    }

    class Child extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Child",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/Parent.svelte generated by Svelte v3.59.2 */
    const file$d = "src/Parent.svelte";

    function create_fragment$f(ctx) {
    	let h2;
    	let t1;
    	let button;
    	let t3;
    	let child;
    	let current;
    	let mounted;
    	let dispose;
    	child = new Child({ $$inline: true });
    	child.$on("myEvent", /*myEvent_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Parent!";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Parent click!";
    			t3 = space();
    			create_component(child.$$.fragment);
    			add_location(h2, file$d, 9, 0, 187);
    			add_location(button, file$d, 20, 0, 394);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(child, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
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
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t3);
    			destroy_component(child, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Parent', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Parent> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function myEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({ App, Child });
    	return [click_handler, myEvent_handler];
    }

    class Parent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Parent",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/Example5.svelte generated by Svelte v3.59.2 */

    const { console: console_1$3 } = globals;

    function create_fragment$e(ctx) {
    	let parent;
    	let current;
    	parent = new Parent({ $$inline: true });
    	parent.$on("click", handler);
    	parent.$on("myEvent", myEventHandler);

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
    		p: noop,
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handler(e) {
    	// const e = event.detail.event
    	console.log(e.currentTarget);
    }

    // Child > Parent > Example5 로 Parent에서 별다른 처리를 하지 않자 Example5로 이벤트가 전달됨
    // 하위 컴포넌트가 너무 많은 경우에는 그다지 유용하지 않고 store를 사용하는것이 좋다.
    // 1, 2 depth 정도로만 사용하자.
    function myEventHandler(e) {
    	console.log(e.detail.myName);
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Example5', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Example5> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Parent, handler, myEventHandler });
    	return [];
    }

    class Example5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example5",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/Example6/Neo.svelte generated by Svelte v3.59.2 */
    const file$c = "src/Example6/Neo.svelte";

    function create_fragment$d(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = `Neo(${/*pm*/ ctx[0]})`;
    			add_location(h3, file$c, 4, 0, 86);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Neo', slots, []);
    	const pm = getContext('pm');
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Neo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getContext, pm });
    	return [pm];
    }

    class Neo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Neo",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/Example6/Emily.svelte generated by Svelte v3.59.2 */
    const file$b = "src/Example6/Emily.svelte";

    function create_fragment$c(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = `Emily(${/*pm*/ ctx[0]})`;
    			add_location(h3, file$b, 4, 0, 86);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Emily', slots, []);
    	const pm = getContext('pm');
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Emily> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getContext, pm });
    	return [pm];
    }

    class Emily extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Emily",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/Example6/Anderson.svelte generated by Svelte v3.59.2 */
    const file$a = "src/Example6/Anderson.svelte";

    function create_fragment$b(ctx) {
    	let h2;
    	let t3;
    	let ul;
    	let li0;
    	let neo;
    	let t4;
    	let li1;
    	let emily;
    	let current;
    	neo = new Neo({ $$inline: true });
    	emily = new Emily({ $$inline: true });

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = `Anderson(${/*pm*/ ctx[0]})`;
    			t3 = space();
    			ul = element("ul");
    			li0 = element("li");
    			create_component(neo.$$.fragment);
    			t4 = space();
    			li1 = element("li");
    			create_component(emily.$$.fragment);
    			add_location(h2, file$a, 7, 0, 159);
    			add_location(li0, file$a, 10, 2, 191);
    			add_location(li1, file$a, 13, 2, 218);
    			add_location(ul, file$a, 9, 0, 184);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			mount_component(neo, li0, null);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			mount_component(emily, li1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(neo.$$.fragment, local);
    			transition_in(emily.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(neo.$$.fragment, local);
    			transition_out(emily.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul);
    			destroy_component(neo);
    			destroy_component(emily);
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
    	validate_slots('Anderson', slots, []);
    	const pm = getContext('pm');
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Anderson> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getContext, Neo, Emily, pm });
    	return [pm];
    }

    class Anderson extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Anderson",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Example6/Heropy.svelte generated by Svelte v3.59.2 */
    const file$9 = "src/Example6/Heropy.svelte";

    function create_fragment$a(ctx) {
    	let h1;
    	let t3;
    	let ul;
    	let li;
    	let anderson;
    	let current;
    	anderson = new Anderson({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = `Heropy(${/*pm*/ ctx[0]})`;
    			t3 = space();
    			ul = element("ul");
    			li = element("li");
    			create_component(anderson.$$.fragment);
    			set_style(h1, "color", "red");
    			add_location(h1, file$9, 10, 0, 246);
    			add_location(li, file$9, 14, 2, 298);
    			add_location(ul, file$9, 13, 0, 291);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);
    			mount_component(anderson, li, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(anderson.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(anderson.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul);
    			destroy_component(anderson);
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

    const pocketMoney = 10000;

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Heropy', slots, []);
    	setContext('pm', pocketMoney);
    	const pm = getContext('pm');
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Heropy> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		setContext,
    		getContext,
    		Anderson,
    		pocketMoney,
    		pm
    	});

    	return [pm];
    }

    class Heropy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Heropy",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Example6/Evan.svelte generated by Svelte v3.59.2 */
    const file$8 = "src/Example6/Evan.svelte";

    function create_fragment$9(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = `Evan(${/*pm*/ ctx[0]})`;
    			add_location(h1, file$8, 4, 0, 86);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
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
    	validate_slots('Evan', slots, []);
    	const pm = getContext('pm');
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Evan> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getContext, pm });
    	return [pm];
    }

    class Evan extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Evan",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Example6/Lewis.svelte generated by Svelte v3.59.2 */
    const file$7 = "src/Example6/Lewis.svelte";

    function create_fragment$8(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = `Lewis(${/*pm*/ ctx[0]})`;
    			add_location(h1, file$7, 4, 0, 86);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
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
    	validate_slots('Lewis', slots, []);
    	const pm = getContext('pm');
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Lewis> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getContext, pm });
    	return [pm];
    }

    class Lewis extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lewis",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Example6.svelte generated by Svelte v3.59.2 */
    const file$6 = "src/Example6.svelte";

    function create_fragment$7(ctx) {
    	let h1;
    	let t3;
    	let div;
    	let heropy;
    	let t4;
    	let lewis;
    	let t5;
    	let evan;
    	let current;
    	heropy = new Heropy({ $$inline: true });
    	lewis = new Lewis({ $$inline: true });
    	evan = new Evan({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = `App(${/*pm*/ ctx[0]})`;
    			t3 = space();
    			div = element("div");
    			create_component(heropy.$$.fragment);
    			t4 = space();
    			create_component(lewis.$$.fragment);
    			t5 = space();
    			create_component(evan.$$.fragment);
    			attr_dev(h1, "class", "svelte-isrrkl");
    			add_location(h1, file$6, 11, 0, 281);
    			attr_dev(div, "class", "svelte-isrrkl");
    			add_location(div, file$6, 12, 0, 300);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(heropy, div, null);
    			append_dev(div, t4);
    			mount_component(lewis, div, null);
    			append_dev(div, t5);
    			mount_component(evan, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(heropy.$$.fragment, local);
    			transition_in(lewis.$$.fragment, local);
    			transition_in(evan.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(heropy.$$.fragment, local);
    			transition_out(lewis.$$.fragment, local);
    			transition_out(evan.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			destroy_component(heropy);
    			destroy_component(lewis);
    			destroy_component(evan);
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
    	validate_slots('Example6', slots, []);
    	const pm = getContext('pm');
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example6> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getContext, Heropy, Evan, Lewis, pm });
    	return [pm];
    }

    class Example6 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example6",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Example7/Fruit.svelte generated by Svelte v3.59.2 */

    const { console: console_1$2 } = globals;
    const file$5 = "src/Example7/Fruit.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*fruit*/ ctx[0]);
    			add_location(div, file$5, 15, 0, 302);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fruit*/ 1) set_data_dev(t, /*fruit*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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

    let count = 0;
    console.log('Module context!');

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fruit', slots, []);
    	let { fruit } = $$props;

    	// 컴포넌트마다 호출됨
    	console.log('each component init!');

    	$$self.$$.on_mount.push(function () {
    		if (fruit === undefined && !('fruit' in $$props || $$self.$$.bound[$$self.$$.props['fruit']])) {
    			console_1$2.warn("<Fruit> was created without expected prop 'fruit'");
    		}
    	});

    	const writable_props = ['fruit'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Fruit> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		count += 1;
    		console.log(count);
    	};

    	$$self.$$set = $$props => {
    		if ('fruit' in $$props) $$invalidate(0, fruit = $$props.fruit);
    	};

    	$$self.$capture_state = () => ({ count, fruit });

    	$$self.$inject_state = $$props => {
    		if ('fruit' in $$props) $$invalidate(0, fruit = $$props.fruit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fruit, click_handler];
    }

    class Fruit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { fruit: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fruit",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get fruit() {
    		throw new Error("<Fruit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fruit(value) {
    		throw new Error("<Fruit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example7.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$4 = "src/Example7.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (17:0) {#each fruits as fruit}
    function create_each_block$1(ctx) {
    	let fruit;
    	let current;

    	fruit = new Fruit({
    			props: { fruit: /*fruit*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(fruit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fruit, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fruit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fruit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fruit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(17:0) {#each fruits as fruit}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let button;
    	let t1;
    	let each_1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*fruits*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Total count log!";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(button, file$4, 12, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fruits*/ 1) {
    				each_value = /*fruits*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			dispose();
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
    	validate_slots('Example7', slots, []);
    	let fruits = ['Apple', 'Banana', 'Cherry', 'Mango', 'Orange'];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Example7> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		console.log(count);
    	};

    	$$self.$capture_state = () => ({ Fruit, count, fruits });

    	$$self.$inject_state = $$props => {
    		if ('fruits' in $$props) $$invalidate(0, fruits = $$props.fruits);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fruits, click_handler];
    }

    class Example7 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example7",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/AudioPlayter.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$3 = "src/AudioPlayter.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let audio;
    	let track;
    	let audio_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			audio = element("audio");
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$3, 29, 4, 461);
    			if (!src_url_equal(audio.src, audio_src_value = /*src*/ ctx[0])) attr_dev(audio, "src", audio_src_value);
    			audio.controls = true;
    			add_location(audio, file$3, 25, 2, 403);
    			add_location(div, file$3, 24, 0, 395);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, audio);
    			append_dev(audio, track);
    			/*audio_binding*/ ctx[2](audio);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 1 && !src_url_equal(audio.src, audio_src_value = /*src*/ ctx[0])) {
    				attr_dev(audio, "src", audio_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*audio_binding*/ ctx[2](null);
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

    const players = new Set();

    function stopAll() {
    	console.log(players);
    	players.forEach(p => p.pause());
    }

    function startAll() {
    	players.forEach(p => p.play());
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AudioPlayter', slots, []);
    	let { src } = $$props;
    	let player;

    	onMount(() => {
    		// Like players.push(player)
    		players.add(player);
    	});

    	$$self.$$.on_mount.push(function () {
    		if (src === undefined && !('src' in $$props || $$self.$$.bound[$$self.$$.props['src']])) {
    			console_1.warn("<AudioPlayter> was created without expected prop 'src'");
    		}
    	});

    	const writable_props = ['src'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<AudioPlayter> was created with unknown prop '${key}'`);
    	});

    	function audio_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			player = $$value;
    			$$invalidate(1, player);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('src' in $$props) $$invalidate(0, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({
    		players,
    		stopAll,
    		startAll,
    		onMount,
    		src,
    		player
    	});

    	$$self.$inject_state = $$props => {
    		if ('src' in $$props) $$invalidate(0, src = $$props.src);
    		if ('player' in $$props) $$invalidate(1, player = $$props.player);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, player, audio_binding];
    }

    class AudioPlayter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { src: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AudioPlayter",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get src() {
    		throw new Error("<AudioPlayter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<AudioPlayter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example8.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/Example8.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (18:0) {#each audioTracks as src }
    function create_each_block(ctx) {
    	let audioplayer;
    	let current;

    	audioplayer = new AudioPlayter({
    			props: { src: /*src*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:0) {#each audioTracks as src }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let each_1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*audioTracks*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Stop all!";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Start all!";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(button0, file$2, 10, 0, 290);
    			add_location(button1, file$2, 13, 0, 340);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", stopAll, false, false, false, false),
    					listen_dev(button1, "click", startAll, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*audioTracks*/ 1) {
    				each_value = /*audioTracks*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('Example8', slots, []);

    	let audioTracks = [
    		"https://sveltejs.github.io/assets/music/strauss.mp3",
    		"https://sveltejs.github.io/assets/music/holst.mp3",
    		"https://sveltejs.github.io/assets/music/satie.mp3"
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example8> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AudioPlayer: AudioPlayter,
    		stopAll,
    		startAll,
    		audioTracks
    	});

    	$$self.$inject_state = $$props => {
    		if ('audioTracks' in $$props) $$invalidate(0, audioTracks = $$props.audioTracks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [audioTracks];
    }

    class Example8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example8",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/TextField.svelte generated by Svelte v3.59.2 */

    const file$1 = "src/TextField.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let input;
    	let input_style_value;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{ type: "text" },
    		{
    			style: input_style_value = "color: " + /*color*/ ctx[1] + ";"
    		},
    		/*$$restProps*/ ctx[2]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			set_attributes(input, input_data);
    			toggle_class(input, "svelte-1bjxqwu", true);
    			add_location(input, file$1, 9, 2, 212);
    			attr_dev(div, "class", "my-custom-input svelte-1bjxqwu");
    			add_location(div, file$1, 8, 0, 180);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				{ type: "text" },
    				dirty & /*color*/ 2 && input_style_value !== (input_style_value = "color: " + /*color*/ ctx[1] + ";") && { style: input_style_value },
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2]
    			]));

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			toggle_class(input, "svelte-1bjxqwu", true);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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
    	const omit_props_names = ["value","color"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextField', slots, []);
    	let { value } = $$props;
    	let { color } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<TextField> was created without expected prop 'value'");
    		}

    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<TextField> was created without expected prop 'color'");
    		}
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('color' in $$new_props) $$invalidate(1, color = $$new_props.color);
    	};

    	$$self.$capture_state = () => ({ value, color });

    	$$self.$inject_state = $$new_props => {
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('color' in $$props) $$invalidate(1, color = $$new_props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, color, $$restProps, input_input_handler];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0, color: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Example9.svelte generated by Svelte v3.59.2 */

    function create_fragment$1(ctx) {
    	let textfield0;
    	let updating_value;
    	let t;
    	let textfield1;
    	let updating_value_1;
    	let current;

    	function textfield0_value_binding(value) {
    		/*textfield0_value_binding*/ ctx[2](value);
    	}

    	let textfield0_props = {
    		color: "yellowgreen",
    		type: "email",
    		placeholder: "ID!",
    		maxlength: "10",
    		required: true
    	};

    	if (/*id*/ ctx[0] !== void 0) {
    		textfield0_props.value = /*id*/ ctx[0];
    	}

    	textfield0 = new TextField({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield0, 'value', textfield0_value_binding));

    	function textfield1_value_binding(value) {
    		/*textfield1_value_binding*/ ctx[3](value);
    	}

    	let textfield1_props = {
    		color: "red",
    		type: "password",
    		placeholder: "Password",
    		required: true
    	};

    	if (/*pw*/ ctx[1] !== void 0) {
    		textfield1_props.value = /*pw*/ ctx[1];
    	}

    	textfield1 = new TextField({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield1, 'value', textfield1_value_binding));

    	const block = {
    		c: function create() {
    			create_component(textfield0.$$.fragment);
    			t = space();
    			create_component(textfield1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(textfield1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const textfield0_changes = {};

    			if (!updating_value && dirty & /*id*/ 1) {
    				updating_value = true;
    				textfield0_changes.value = /*id*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			const textfield1_changes = {};

    			if (!updating_value_1 && dirty & /*pw*/ 2) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*pw*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(textfield1, detaching);
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
    	validate_slots('Example9', slots, []);
    	let id = '';
    	let pw = '';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Example9> was created with unknown prop '${key}'`);
    	});

    	function textfield0_value_binding(value) {
    		id = value;
    		$$invalidate(0, id);
    	}

    	function textfield1_value_binding(value) {
    		pw = value;
    		$$invalidate(1, pw);
    	}

    	$$self.$capture_state = () => ({ TextField, id, pw });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('pw' in $$props) $$invalidate(1, pw = $$props.pw);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, pw, textfield0_value_binding, textfield1_value_binding];
    }

    class Example9 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example9",
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
    	let h15;
    	let t11;
    	let h16;
    	let t13;
    	let h17;
    	let t15;
    	let h18;
    	let t17;
    	let example9;
    	let current;
    	example9 = new Example9({ $$inline: true });

    	const block = {
    		c: function create() {
    			h10 = element("h1");
    			h10.textContent = "1. 컴포넌트 개요 (with 컴포넌트 바인딩)";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = "2. 부모에서 자식으로(Props)";
    			t3 = space();
    			h12 = element("h1");
    			h12.textContent = "3. Props 양방향 바인딩";
    			t5 = space();
    			h13 = element("h1");
    			h13.textContent = "4. 자식에서 부모로 (Event Dispatcher)";
    			t7 = space();
    			h14 = element("h1");
    			h14.textContent = "5. 기본/커스텀 이벤트 포워딩(Forwarding)";
    			t9 = space();
    			h15 = element("h1");
    			h15.textContent = "6. ContextAPI (getContext, setContext)";
    			t11 = space();
    			h16 = element("h1");
    			h16.textContent = "7. 모듈 상황(Module context)에서 데이터 정의";
    			t13 = space();
    			h17 = element("h1");
    			h17.textContent = "8. 오디오 플레이어 예제";
    			t15 = space();
    			h18 = element("h1");
    			h18.textContent = "9. $$props와 $$restProps";
    			t17 = space();
    			create_component(example9.$$.fragment);
    			add_location(h10, file, 12, 0, 407);
    			add_location(h11, file, 15, 0, 468);
    			add_location(h12, file, 18, 0, 522);
    			add_location(h13, file, 21, 0, 573);
    			add_location(h14, file, 24, 0, 638);
    			add_location(h15, file, 27, 0, 702);
    			add_location(h16, file, 30, 0, 775);
    			add_location(h17, file, 33, 0, 843);
    			add_location(h18, file, 36, 0, 892);
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
    			insert_dev(target, h15, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, h16, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h17, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, h18, anchor);
    			insert_dev(target, t17, anchor);
    			mount_component(example9, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(example9.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(example9.$$.fragment, local);
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
    			if (detaching) detach_dev(h15);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(h16);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h17);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(h18);
    			if (detaching) detach_dev(t17);
    			destroy_component(example9, detaching);
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
    		Example4,
    		Example5,
    		Example6,
    		Example7,
    		Example8,
    		Example9
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
