<script>
  import Address from './Address.svelte'

  let address = {
    label: '대한민국',
    children: [
      {
        label: '경기도',
        children: [
          {label: '수원'},
          {label: '성남',
            children: [
              {label: '중원구'},
              {label: '수정구'},
              {label: '분당구'}
            ]
          }
        ]
      },
      {
        label: '강원도',
        children: [
          {label: '강릉'},
          {label: '속초'}
        ]
      }
    ]
  }
</script>

<Address {address} />