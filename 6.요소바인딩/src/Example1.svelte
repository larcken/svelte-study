<script>
  import {tick} from 'svelte'
  let isShow = false

  // input element에 bind할 변수
  let inputEl

  async function toggle() {
    isShow = !isShow

    // toggle 이벤트 호출될때 focus 이동이 되지 않는다.
    // 렌더링될때까지 기다려줘야해서 tick을 사용하면 focus 이동하는것을 확인할 수 있다.
    await tick()

    // element를 검색해서 사용하는 방법
    // const inputEl = document.querySelector('input')
    // inputEl && inputEl.focus()

    inputEl && inputEl.focus()
  }

</script>

<button on:click={toggle}>Edit!</button>
{#if isShow}

  <!-- this로 변수와 element를 연결할 수 있다. -->
  <input bind:this={inputEl} />
{/if}