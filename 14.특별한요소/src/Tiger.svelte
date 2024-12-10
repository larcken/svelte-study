<script>
  let age = 11
  export let name = 'Tiger'
  export function getAge() {
    console.log(age)
  }
</script>
<!-- 접근을 허용하고자 하는 변수에 export를 붙여주면 접근할 수 있음 -->
<svelte:options accessors />

<h1 on:click={getAge}>{name}!</h1>