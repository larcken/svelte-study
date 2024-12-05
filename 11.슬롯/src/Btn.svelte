<script>
  export let block
  export let color
</script>

<!-- <button class="{block ? 'block' : ''}"> -->
<button 
    class:block
    style="
        background-color:{color};
        color: {color ? 'white' : ''}">
  <!-- fallback content 는 대체컨텐트라고 아무값이 없을때 사용될 컨텐트를 명시할 수 있다. -->
  <slot>Default button!</slot>
  
</button>

<style>
  button {
    background: lightgray;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: .2s;
  }
  button:hover {
    text-decoration: underline;
  }
  button:active {
    transform: scale(1.05);
  }
  button.block {
    width: 100%;
    display: block;
  }

</style>