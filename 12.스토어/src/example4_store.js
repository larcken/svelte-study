import {writable, derived, readable, get} from 'svelte/store'

export let count = writable(1)
export let double = derived(count, $count => $count * 2)
export let user = readable({
  name: 'Heropy',
  age: 20,
  email: 'aaa@ddd.ccc'
})

console.log(get(count))
console.log(get(double))
console.log(get(user))