<script>
  import Example1 from './Example1.svelte'
  import Example2 from './Example2.svelte'
  import Example3 from './Example3.svelte'
  import Example4 from './Example4.svelte'
  import Example5 from './Example5.svelte'
  import Example6 from './Example6.svelte'

</script>

<h2>1. 컴포넌트 재귀 호출(self)</h2>
<!-- <Example1 /> -->
<h2>2. 동적 컴포넌트 랜더링(component)</h2>
<!-- <Example2 /> -->
<h2>3. window</h2>
<!-- <Example3 /> -->
<h2>4. head, body</h2>
<!-- <Example4 /> -->
<h2>5. options - 불변성 선언(immutable)</h2>
<!-- <Example5 /> -->
<h2>6. options - 접근 허용(accessors)</h2>
<Example6 />