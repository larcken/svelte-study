<script>
  let name = 'Example'
  let index = 0;
</script>

<!-- @debug -->
<!-- 콘솔에 내용을 출력할 수 있다. -->
<!-- 브라우져에서 브레이크 포인트가 되기도 한다. -->
{@debug index, name}
<h1 on:click={() => {index++}}>Hello {name}</h1>