import {writable, derived} from 'svelte/store'

export let count = writable(1)

// 기존에 생성되어 있는 스토어 기준으로 동작, 계산된 스토어
// count 스토어 기반으로 동작
// export let double = derived(count, ($count) => {
//   return $count * 2
// })

export let double = derived(count, $count => $count * 2)
// 여러개 매개변수 전달
export let total = derived([count, double], ([$count, $double], set) => {
  // return $count + $double
  
  // count, double 두개 다 변경되었기 때문에 두번 호출됨
  // 연결된 스토어가 변경되면 매번 실행된다.
  console.log('total 구독자가 1명 이상일 때!')

  set($count+$double)
  return () => {
    console.log('total 구독자가 0명일 때...')
  }

  // 구독이 초기화되고 다시 수행됨을 알 수 있음
})

// 수행되는데 시간이 필요한 경우 undefined 로 선언되기 때문에 그때 동안 대신 설정할 값을 세팅할 수 있다.
export let initialValue = derived(count, ($count, set) => {
  setTimeout(() => {
    set($count + 1)
  }, 2000)
}, '최초 계산 중...')