<script>
  import Wrap from "./Wrap.svelte";
  
  let fruits = {
    apple: {
      value: '',
      options: {
        readonly: false,
        disabled: false,
        placeholder: 'placeholder A'
      }
    },
    banana: {
      value: 'banana',
      options: {
        disabled: false,
        placeholder: 'placeholder A'
      }
    }
  }

  function add(name) {
    console.log(name)
  }
  function update(name) {
    console.log(name)
  }
  function remove(name) {
    console.log(name)
  }
</script>


<label
  class="fruits_apple"
  name="appple">
  <input 
    bind:value={fruits.apple.value}
    readonly={fruits.apple.options.readonly}
    disabled={fruits.apple.options.disabled}
    placeholder="{fruits.apple.options.placeholder}"
    on:change={() => add('apple')}
  />
</label>

<!-- 수십개의 요소가 다른 경우 컴포넌트로 사용하기 어렵다. 
이럴때 범위를 가진 슬롯을 이용하면 활용이 가능해진다. -->
<Wrap
  scopeName="apple"
  let:_name
>
  <label
    class="fruits_{_name}"
    name="{_name}">
    <input 
      bind:value={fruits[_name].value}
      readonly={fruits[_name].options.readonly}
      disabled={fruits[_name].options.disabled}
      placeholder="{fruits[_name].options.placeholder}"
      on:change={() => add(_name)}
    />
  </label>

</Wrap>

<Wrap
  scopeName="banana"
  let:_name
>
    <input 
      bind:value={fruits[_name].value}
      disabled={fruits[_name].options.disabled}
      placeholder="{fruits[_name].options.placeholder}"
      on:click={() => update(_name)}
    />
</Wrap>