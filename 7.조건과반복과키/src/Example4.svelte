<script>
    import Count from './Count.svelte'

    let reset = false

</script>

<!-- 키 블록은 연결된 데이터의 값이 변경될 때마다 내용을 파괴하고 다시 생성 -->
<!-- reset 값이 변경되면서 내부에 있는 컴포넌트의 변수가 모두 초기화 된다. -->
{#key reset}
    <Count />
{/key}

<button on:click={() => reset = !reset}>
    Reset!
</button>
