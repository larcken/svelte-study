<!-- 라이프 사이클을 모듈화해서 컴포넌트화 시킨다. -->

<script>
    import {delayRender} from './lifecycle.js'

    let done = delayRender(1000);
</script>

{#if $done}
    <h1>Something...</h1>
{/if}