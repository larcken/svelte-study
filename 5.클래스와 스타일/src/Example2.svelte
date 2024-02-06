<script>
  let active = false
  let color = 'tomato'
  let white = 'white'
  let colorObj = {
    t: 'blue',
    w: '#FFF'
  }
  let letterSpacing = 'letter-spacing: 5px'
</script>

<!--  -->

<button on:click={() => {active = !active}}>
  Toggle!
</button>

<!-- 여기서 class 는 지시어(디렉티브)이다. -->
<!-- <div class={active ? 'hello' : ''}-->
<div class:hello={active}>
  Hello
</div>

<h2 style="background-color: {color}; color: {white};">
  Example 1
</h2>

<!-- 원하는 스타일을 보간으로 작성해주면 된다. -->
<h2 style="background-color: {colorObj.t}; color: {colorObj.w}; {letterSpacing}">
  Example 2
</h2>

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
  .hello {
    width: 250px;
    background: tomato;
  }
</style>

