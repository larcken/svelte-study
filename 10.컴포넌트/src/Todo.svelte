<script>
  export let todo;
  export let todos;
  export let index;
  

  function deleteTodo() {
    // todos는 부모 컴포넌트에 있어서 사용할 수 없다. 예전 예제에서 store를 사용해서 비슷한 예제를 했었는데 더 쉬운 방법이 있다.
    // 그것이 양방향 데이터 바인딩
    todos.splice(index, 1)
    todos = todos
    console.log(todos)
  }
  
</script>

<div>
  <input type="checkbox" bind:value ={todo.done} />
  {todo.title}
  <button on:click={deleteTodo}>X</button>
</div>