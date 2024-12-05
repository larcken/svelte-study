<script>
  import Child from './Child.svelte'
</script>

<!-- 상위에서 slot에 전달하려고 작성했으나 하위 컴포넌트로 전달하기 위해서는 slot forwarding이 되어야 함 -->
<Child let:scoped>
  <slot></slot>
  <slot name="named" slot="named-child"></slot>
  <slot name="scoped" slot="scoped-child" {scoped}></slot>
</Child>
