<script>
  import Todo from './Todo.svelte'

  let todos =[
    {id:1, title: 'Breakfast', done: false},
    {id:2, title: 'Lunch', done: false},
    {id:3, title: 'Dinner', done: false}
  ]
</script>

{#each todos as todo, index (todo.id) }
  <!-- 이렇게 작성하면 단방향 데이터 바인딩 -->
  <!-- <Todo {todos} {todo} {index} /> -->

  <!-- 이렇게 고쳐야 양방향 데이터 바인딩이 된다. -->
  <!-- <Todo bind:todos={todos} {todo} {index} /> -->
  <Todo bind:todos {todo} {index} />

  <!-- 복잡한 과정을 거칠때에는 조심해서 사용해야한다. 이유는 컴포넌트가 연결된것이 많아지면 어디에서 사용하는지 모르게된다. -->
   <!-- 그럴때에는 store를 사용하는것이 좋을 수 있다. -->
{/each}