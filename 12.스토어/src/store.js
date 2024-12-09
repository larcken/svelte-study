import {writable} from 'svelte/store'

// 첫번째 인수는 초기값
// 두번째 인수는 subscribe (구독)이 실행될때 최초로 한번 실행되는 익명함수
// 반환되는 함수는 구독자가 완전히 없어지면 실행
export let count = writable(0, () => {
  console.log('count 구독자가 1명 이상일때!')
  return () => {
    console.log('count 구독자가 0명일 때...')
  }
})

export let name = writable('Heropy', () => {
  console.log('name 구독자가 1명 이상일때!')
  return () => {
    console.log('name 구독자가 0명일 때...')
  }
})


// svelte 컴포넌트에서는 자동구독 형태를 사용할 수 있음
// svelte 컴포넌트가 아닌 곳에서는 수동구독 형태로 관리해야함
