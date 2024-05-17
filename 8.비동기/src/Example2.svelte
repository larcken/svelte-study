<script>
  let isError = false

  function a() {
    // 대기 (pending) : 이행하거나 거부되지 않은 초기 상태
    return new Promise((resolve, reject) => {
        if(isError) {
            // reject('Sorry...')
            reject(new Error('Sorry...'))
            // 다음 동작을 하지 않게 하려면 return을 추가하면 된다.
            return
        }
        setTimeout(() => {
            console.log("a");
            // 이행 (fulfilled) : 연산이 성공적으로 완료됨
            resolve('hds');
        }, 1000);
    });
  }
  
  // isError의 값에 따라 출력문이 달라지는것을 확인

  // 1. then catch 사용
//   a()
    // 이행 (fulfilled) : 연산이 성공적으로 완료됨
//     .then(() => {
//         console.log('b')
//     })
    //거부 (rejected) : 연산이 실패함
//     .catch((err) => {
//         console.log(err)
//     })

    // 2. async await를 사용하여 동일하게 동작하는것 확인
    // async function asyncFn() {
    //     try {
    //         // isError 가 false일때 실행
    //         await a()
    //         console.log('b')
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }
    // asyncFn()

    // 3. then catch finally
    // finally는 isError 값과 상관없이 무조건 실행
    // a()
    //     .then((res) => {
    //         console.log('b')
            
    //         // resolve에서 넘겨준 인수를 출력
    //         console.log(res)
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //     })
    //     .finally(() => {
    //         console.log('Done')
    //     })

    // 4. async await + finally
    // async function asyncFn() {
    //     try {
    //         // isError 가 false일때 실행
    //         const res = await a()
    //         // resolve 에 넣어 준 인수를 반환해서 출력
    //         console.log(res)
    //         console.log('b')
    //     } catch (err) {
    //         console.log(err.message)
    //     } finally {
    //         console.log('Done!')
    //     }
    // }
    // asyncFn()

    /**
     * 비동기 상태의 용어
     * 
     * 대기 (pending) : 이행하거나 거부되지 않은 초기 상태
     * 이행 (fulfilled) : 연산이 성공적으로 완료됨
     * 거부 (rejected) : 연산이 실패함
    */

</script>
