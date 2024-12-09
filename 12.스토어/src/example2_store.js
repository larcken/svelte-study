import {readable} from 'svelte/store'

const userData = {
  name: 'Heropy',
  age: 30,
  email: 'aaa@abc.com',
  token: 'asdfsadfasdf'
}

export let user = readable(userData, (set) => {
  console.log('user 구독자가 1명 이상일 때')

  // readable은 set 이란 매개변수를 쓸 수 있다.
  // 최초에 해당하는 데이터를 수정할 수 있는 방법
  // 외부에서 데이터를 가져올때 민감한 정보가 있는 경우 최초 데이터에서 제거해야하는 경우 등에서 사용할 수 있다.
  delete userData.token
  set(userData)

  return () => {
    console.log('user 구독자가 0명일때..')
  }
})