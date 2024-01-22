import {onMount, onDestroy, beforeUpdate, afterUpdate} from 'svelte'

// 그냥 delayRender에서 값을 반환하면 동작하지 않기때문에 여기서는 스토어를 사용해서 동작하도록 한다.
import { writable } from 'svelte/store';

export function lifecycle() {
    onMount(() => {
        console.log('Mounted!');
    })
    
    onDestroy(() => {
        console.log('onDestroy!');
    })
    
    beforeUpdate(() => {
        console.log('beforeUpdate!');
    })
    
    afterUpdate(() => {
        console.log('afterUpdate!');
    })
}

// delay 매게변수에 값이 없으면 디폴트로 3000 ms
export function delayRender(delay = 3000) {
    let render = writable(false);
    onMount(() => {
        setTimeout(() => {
            // $render : store에서는 $변수를 사용할 수 있는데 svelte 문법이기 때문에 js 에서는 사용하지 못한다.
            // $render = true;
            render.set(true);
        }, delay)
    })
    return render;
}