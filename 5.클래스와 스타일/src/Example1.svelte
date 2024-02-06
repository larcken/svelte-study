<script>
  let active = false
</script>

<!-- 토글 버튼을 클릭하면 class가 변하는 기본적인 클래스 바인딩 -->

<button on:click={() => {active = !active}}>
  Toggle!
</button>

<div class={active ? 'active' : ''}>
  Hello
</div>

<style>
  div {
    width: 120px;
    height: 200px;
    background: royalblue;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 20px;
    transition: .4s;
  }
  .active {
    width: 250px;
    background: tomato;
  }
</style>

