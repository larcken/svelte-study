<script>
  import Fruits from './Fruits.svelte'  
</script>

<h2>Example4.svelte</h2>
<ul class="fruits">
  <li>Apple</li>
  <li>Banana</li>
  <li>Cherry</li>
</ul>

<Fruits />

<style>
  /* 스타일 유효범위
    컴포넌트 내부에 작성된 스타일은 자신이 작성된 컴포넌트 내부에서만 유효하다. 
    이러한것을 스타일 해쉬라고 한다.
  */
  /* .fruits {
    color: red;
  } */

  /* 전역으로 스타일을 적용할 수 있다. */
  /* :global 수식어를 통해서 전역에서 사용 가능해진다. */
  /* :global(.fruits) {
    color: red;
  } */

  /* 사용하지 않는 css 는 svelte 컴파일러가 필요없다고 판단하여 css 번들에 포함하지 않는다. */
  .example {
    color: orange;
  }

  /* 사용하지 않더라도 :global로 만들어주면 사용 유무 상관없이 css 번들에 포함된다.*/
  :global(.example1) {
    color: orange;
  }
</style>