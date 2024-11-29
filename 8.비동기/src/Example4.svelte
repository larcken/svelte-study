<script>
  // let promise = new Promise(resolve => resolve('Hmm...'))
  let promise = Promise.resolve('Hmm..')
  let isError = false
  
  function fetchName() {
    return new Promise((resolve, reject) => {
      // if(isError) {
      //   reject(new Error('Sorry'))
      // }
      setTimeout(() => {
        resolve('Heropy')
      }, 0)
    })
  }

</script>


<!-- <button on:click={() => {
  promise = fetchName()
  console.log(promise)
}}>
  Fetch Name!
</button> -->

<!-- console의 로그가 달라짐. 문자열로 출력 -->
<!-- <button on:click={async () => {
  promise = await fetchName()
  // console.log(await promise)
  console.log(promise)
}}>
  Fetch Name!
</button> -->

<!-- promise then 으로 수행하는 방법 -->
<!-- <button on:click={() => {
  promise = fetchName()
  promise.then((res) => {
    console.log(res)
  })
  
}}>
  Fetch Name!
</button> -->


<button on:click={() => {
  promise = fetchName()
  
}}>
  Fetch Name!
</button>



{#await promise}
  <!-- 대기(Pending) -->
  <p>Loading...</p>
{:then name}
  <!-- 이행(Fulifiled) -->
  <h1>{name}</h1>
{:catch error}
<!-- 거부(Rejected) -->
<h1>{error.message}</h1>
{/await}


<!-- 간소화 하는 방법 (대기 거부 없이 이행만 있으면 된다면..) -->
{#await promise then name}
<h1>{name}</h1>
{/await}