<script>
  import {createEventDispatcher} from 'svelte'
  export let todo;

  const dispatch = createEventDispatcher()

  function deleteTodo() {
    // delete 버튼을 클릭하면 부모 컴포넌트에게 todos에 선택된 항목이 삭제되도록 요청만 하는걸로 진행
    // custom event 이름 명기
    // dispatch('deleteMe', todo.id)
    
    // dispatch를 여러개 사용한다면 이 처럼 객체형태로 detail을 넘겨주는게 좋다.
    // 부모에서도 관련부분 적용되도록 수정
    dispatch('deleteMe', {
      todoId: todo.id
    })
  }
  
</script>

<div>
  <input type="checkbox" bind:value ={todo.done} />
  {todo.title}
  <button on:click={deleteTodo}>X</button>
</div>