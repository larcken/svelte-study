<script>
  // a 함수가 실행되고 다음 b가 수행되도록 하는것을 보장하기 위해 콜백 함수를 사용한다.
  // function a(callback) {
  //   // console.log('a')

  //   setTimeout(() => {
  //     console.log('a')
  //     callback()
  //   }, 1000)
  // }
  // function b() {
  //   console.log('b')
  // }

  // 동기 방식 (작성된 순서대로 동작)
  // a()
  // b()

  // 콜백함수 호출
  // a(() => {b()})

  /**
   * 콜백지옥
   * @param cb
   */
  // function a(cb) {
  //   setTimeout(() => {
  //     console.log('a')
  //     cb()
  //   }, 1000)
  // }
  // function b(cb) {
  //   setTimeout(() => {
  //     console.log('b')
  //     cb()
  //   }, 1000)
  // }
  // function c(cb) {
  //   setTimeout(() => {
  //     console.log('c')
  //     cb()
  //   }, 1000)
  // }
  // function d(cb) {
  //   setTimeout(() => {
  //     console.log('d')
  //     cb()
  //   }, 1000)
  // }

  // a(() => {
  //   b(() => {
  //     c(() => {
  //       d(()=>{
  //         console.log('done')
  //       })
  //     })
  //   })
  // })

  // // 콜백 지옥의 코드 형태는 clean하지 않기 때문에 순서를 보장하면서 간결한 코드를 사용하기 위해 promise를 이용한다.
  // function a() {
  //   // js에는 Promise라는 생성자 객체가 있음
  //   // 어떠한것을 기다리는것을 약속한다.
  //   // a 함수의 매개변수로 callback 함수를 받는게 아닌 promise에서 resolve로 수행하고자 하는 시점을 정할 수 있다.
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       console.log('a')
  //       resolve()
  //     }, 1000)
  //   })
  // }

  // function b() {
  //   console.log('b')
  // }

  // // promise가 반환한 객체는 then을 수행할 수 있고 then 은 resolve 가 있는 위치에서 수행된다.
  // a().then(() => {
  //   b()
  // })

  function a() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("a");
        resolve();
      }, 1000);
    });
  }
  function b() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("b");
        resolve();
      }, 1000);
    });
  }
  function c() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("c");
        resolve();
      }, 1000);
    });
  }
  function d() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("d");
        resolve();
      }, 1000);
    });
  }

  // then 메소드를 사용하는 다양한 방법
  
  // 1.
  // a().then(() => {
  //   b().then(() => {
  //     c().then(() => {
  //       d();
  //     });
  //   });
  // });

  // 2.
  // a().then(()=>{
  //   return b()
  // }).then(() => {
  //   return c()
  // })

  // 3. best 간결하게 사용
  // a()
  //   .then(()=>b())
  //   .then(()=>c())
  //   .then(()=>d())

  // async, await 사용
  // Promise 가 함수가 있으면 await를 사용할 수 있다.
  // a 수행하고 b.. c.. d.. 수행
  // await 를 쓰려면 async 를 붙여줘야한다.
  async function asyncFn() {
    await a()
    await b()
    await c()
    await d()
  }  
  console.log('aa')
  asyncFn()

</script>
