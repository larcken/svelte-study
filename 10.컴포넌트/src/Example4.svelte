<script>
  import Todo from './Todo_Example4.svelte'

  let todos =[
    {id:1, title: 'Breakfast', done: false},
    {id:2, title: 'Lunch', done: false},
    {id:3, title: 'Dinner', done: false}
  ]

  function deleteTodo(event) {
    // createEventDispatcher 함수에서 new CustomEvent()를 통해 커스텀 이벤트를 생성
    // 따라서 event.detail을 사용할 수 있음
    // console.log(event.detail)
    
    // const todoId = event.detail;
    const todoId = event.detail.todoId;
    const index = todos.findIndex(t => t.id === todoId)
    todos.splice(index, 1)
    todos = todos
  }

</script>

{#each todos as todo(todo.id) }
<!-- deleteMe라고 자식 컴포넌트에서 호출하는 함수 -->
  <Todo {todo} on:deleteMe={deleteTodo} />
{/each}