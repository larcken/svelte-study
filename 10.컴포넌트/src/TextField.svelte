<script>
  export let value;
  // $$props : 기본적으로 컴포넌트에 내장되어있음. 바깥쪽에서 담는 모든 props를 담는 객체
  // $$restProps : 암시적 props만 담당. $$props는 암시 명시 모두 가지고 있음
  export let color;

</script>

<div class="my-custom-input">
  <input type="text" 
    style="color: {color};"  
    bind:value {...$$restProps} 
  />
</div>

<style>
  .my-custom-input input {
    border-radius: 100px;
    padding: 10px 20px;
  }
</style>