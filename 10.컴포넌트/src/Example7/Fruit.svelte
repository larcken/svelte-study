<script context="module">
  // 모든 컴포넌트를 아우르는 전역적인 변수가 되었음
  // 최초 한번만 정의됨
  // 반응성을 가지지 못함 (데이터는 변경되지만 화면갱신이 되지 않음)
  // export를 추가하면 내보내기가 됨
  export let count = 0
  console.log('Module context!')
</script>

<script>
  export let fruit
  // 컴포넌트마다 호출됨
  console.log('each component init!')
</script>

<div on:click={() => {
  count += 1
  console.log(count)
}}>
  {fruit} 

</div>