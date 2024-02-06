<script>
  let innerHTML = '';
  let textContent = 'hello world!'
</script>

<!-- contenteditable : html에 존재하는 속성, 수정이 가능한 형태로 제공 -->
<div contenteditable
    bind:innerHTML
    bind:textContent>
</div>

<!--html 구조가 같이 출력-->
<div>innerHTML : {innerHTML}</div>
<!-- text만 출력 -->
<div>textContent : {textContent}</div>

<!--html이 해석되서 출력-->
<div>{@html innerHTML}</div>


<style>
  div {
    border: 1px solid blue;
    margin-bottom: 10px;
  }
</style>