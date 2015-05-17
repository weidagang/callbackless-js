/**
 * @author Dagang Wei (weidagang@gmail.com)
 */

var callbackless = (function() {
  /**
   * Creates a promise.
   *
   * A monad is a computational context that returns some values of type T.
   * A promise is an asynchronous monad, or a computatal context that returns
   * a value asynchronously.
   *
   * promise :: Options -> Promise<Data>
   * @param options :: Options { errorToData :: Error -> Data }
   * @return promise of data
   */
  function promise(options) {
    /** 
     * The state of the promise 
     *
     * _state :: enum('PENDING', 'SUCCEEDED', 'FAILED')
     */
    var _state = 'PENDING';
    var _data; // the data of the promise
    var _error; // the error of the promise
    var _successListeners = []; // listeners for data
    var _failureListeners = []; // listeners for error
    var _finishListeners = []; // listeners for finish
    var _options = options || {
      /**
       * Converts error to data. Returns null by default. The user can provide
       * the customized implementation. It's common to throw an exception.
       *
       * errorToData :: Error -> Data
       * @param error :: Error
       * @return void
       * @throws exception if no meaningful data to return
       */
      errorToData : function (error) { return null; }
    };
    
    /**
     * Notifies success of the promise.
     *
     * Precondition: state == PENDING
     *
     * __notifySuccess__ :: Data -> void
     * @param data :: Data
     */
    function __notifySuccess__(data) {
      if (_state != 'PENDING') {
        throw 'The promise is not in PENDING state';
      }
      _state = 'SUCCEEDED';
      _data = data;
      for (var i = 0; i < _successListeners.length; i++) {
        _successListeners[i](data);
      }
      for (var i = 0; i < _finishListeners.length; i++) {
        _finishListeners[i](_state, _data, _error);
      }
    }

    /**
     * Notifies failure of the promise.
     *
     * Precondition: state == PENDING
     *
     * __notifyFailure__ :: Error -> void
     * @param error :: Error
     */
    function __notifyFailure__(error) {
      if (_state != 'PENDING') {
        throw 'The promise is not in PENDING state';
      }
      _state = 'FAILED';
      _error = error;
      for (var i = 0; i < _failureListeners.length; i++) {
        _failureListeners[i](error);
      }
      for (var i = 0; i < _finishListeners.length; i++) {
        _finishListeners[i](_state, _data, _error);
      }
    }

    /**
     * Registers a callback for success event.
     *
     * The callback will be invoked with the data when the promise is finished.
     * If the promise is in SUCCEEDED state at the time of registering, the
     * callback will be invoked immediately with the data before returning.
     *
     * registerSuccessListener :: callback -> void 
     * @param callback :: Data -> void
     * @return promise :: Promise<Data>
     */
    function registerSuccessListener(callback) {
      if (_state == 'PENDING') {
        _successListeners.push(callback);
      } else if (_state == 'SUCCEEDED') {
        callback(_data);
      }
      return this;
    }

    /**
     * Registers a callback for failure event.
     *
     * The callback will be invoked with the data when the promise is failed.
     * If the promise is in FAILED state at the time of registering, the
     * callback will be invoked immediately with the error before returning.
     *
     * registerFailureListener :: callback -> void 
     * @param callback :: Error -> void
     * @return promise :: Promise<Data>
     */
    function registerFailureListener(callback) {
      if (_state == 'PENDING') {
        _failureListeners.push(callback);
      } else if (_state == 'FAILED') {
        callback(_error);
      }
      return this;
    }

    /**
     * Registers a callback for finish event.
     *
     * The callback will be invoked with the data when the promise is finished.
     * If the promise is in finished state at the time of registering, the
     * callback will be invoked immediately before returning.
     *
     * registerFinishListener :: callback -> void 
     * @param callback :: (State, Data, Error) -> Promise<Data>
     * @return promise :: Promise<Data>
     */
    function registerFinishListener(callback) {
      if (_state == 'PENDING') {
        _finishListeners.push(callback);
      } else {
        callback(_state, _data, _error);
      }
      return this;
    }
    
    /**
     * Gets the state of the promise.
     *
     * getState :: void -> State
     * @return the state of the promise
     */
    function getState() {
      return _state;
    }
    
    /**
     * Gets the data of the promise.
     *
     * If the promise is in FAILED state, it will try to get a default value by
     * calling {@code options.errorToData}.
     *
     * getData :: void -> Data
     * @return the data of the promise
     * @throws exception if the promise is in PENDING state
     */
    function getData() {
      if (_state == 'PENDING') {
        throw 'The promise is in PENDING state';
      } else if (_state == 'SUCCEEDED') {
        return _data;
      } else if (_state == 'FAILED') {
        return _options.errorToData(_error);
      }
    }

    return {
      // Public interfaces, visibile to the user of the promise.
      state : getState,
      data : getData,
      succeed : registerSuccessListener,
      fail : registerFailureListener,
      finish : registerFinishListener,

      // Protected interfaces, visibile to the implementations of the promise.
      __notifySuccess__ : __notifySuccess__,
      __notifyFailure__ : __notifyFailure__,
    };
  } //promise
  
  /**
   * Lifts a directly available data into the promise context.
   *
   * A promise is a computational context that returns a value (maybe asynchronously) in the
   * future. In that sense, a directly available data is just a special case of a promise of
   * the data.
   *
   * unit :: T -> Promise<T>
   * @param data :: T
   * @return promise :: Promise<T>
   */
  function unit(data) {
    var p = promise();
    p.__notifySuccess__(data);
    return p;
  }
  
  /**
   * Lifts a function of type T -> R into a function of type
   * Promise<T> -> Promise<R>.
   *
   * fmap makes this Promise abstracton a Functor.
   *
   * fmap :: (T -> R) -> Promise<T> -> Promise<R>
   * @param f :: T -> R
   * @return liftedF :: Promise<T> -> Promise<R>
   */
  function fmap(f) {
    var liftedF = function (promiseT) {
      var promiseR = promise();
      promiseT.succeed(function (data) {
        promiseR.__notifySuccess__(f(data));
      });
      promiseT.fail(function (error) {
        promiseR.__notifyFailure__(error);
      });
      return promiseR;
    };
    return liftedF;
  }
 
  /**
   * Joins a promise of promise into a promise.
   *
   * join :: Promise<Promise<T>> -> Promise<T>
   * @param promiseOfPromiseT :: Promise<Promise<T>>
   * @return promiseT :: Promise<T>
   */
  function join(promiseOfPromiseT) {
    var promiseT = promise();
    // the outer layer of promise
    promiseOfPromiseT.succeed(function (innerPromiseT) {
      // the inner layer of promise
      innerPromiseT.succeed(function (data) {
        promiseT.__notifySuccess__(f(data));
      });
      innerPromiseT.fail(function (error) {
        promiseT.__notifyFailure(error);
      });
    });
    promiseOfPromiseT.fail(function (error) {
      promiseT.__notifyFailure__(error);
    });
    return promiseT;
  }

  /**
   * Lifts a function of type T -> Promise<R> into a function of type
   * Promise<T> -> Promise<R>.
   *
   * flatMap makes this Promise abstracton a Monad. It's the bind operator with different
   * parameters order.
   *
   * flatMap :: (T -> Promise<R>) -> Promise<T> -> Promise<R>
   * @param f :: T -> Promise<R>
   * @return liftedF :: Promise<T> -> Promise<R>
   */
  function flatMap(f) {
    var liftedF = function (promiseT) {
      // fmap(f) :: (T -> Promise<R>) -> Promise<T> -> Promise<Promise<R>>
      // promiseOfPromiseR :: Promise<Promise<R>>
      var promiseOfPromiseR = fmap(f)(promiseT);
      var promiseR = join(promiseOfPromiseR);
      return promiseR;
    };
    return liftedF;
  }

  /**
   * Lifts a function of type T1 -> T2 ... Tn -> R into a function of type
   * Promise<T1> -> Promise<T2> -> ... Promise<Tn> -> Promise<R>.
   *
   * liftA :: (T1 -> T2 ... Tn -> R) -> Promise<T1> -> Promise<T2> -> ... Promise<Tn> -> Promise<R>
   * @param f :: T1 -> T2 ... Tn -> R
   * @return liftedF :: Promise<T1> -> Promise<T2> -> ... Promise<Tn> -> Promise<R>
   */
  function liftA(f) {
    var numArgs = f.length;
    // The parameters of liftedF are implicit because the numArgs is only known at runtime.
    // This is just a syntactic trick of JS, anyhow don't forget the type of liftedF is
    // Promise<T1> -> Promise<T2> -> ... Promise<Tn> -> Promise<R>.
    var liftedF = function() {
      var promiseR = promise();

      var promisesT = [];
      for (var i = 0; i < arguments.length; i++) {
        promisesT.push(arguments[i]);
      }
      // if the actual number of arguments is less than the expected, add unit(null) as the default
      for (var i = arguments.length; i < numArgs; i++) {
        promisesT.push(unit(null));
      }

      var finishedCount = promisesT.length - arguments.length;
      for (var i = 0; i < numArgs; i++) {
        promisesT[i].finish(function (state, data, error) {
          finishedCount++;
          // all the promises have finished, then finishes promiseR
          if (finishedCount == numArgs) {
            var args = promisesT.map(function (promiseT) { return promiseT.data(); });
            var r = f.apply(null, args);
            promiseR.__notifySuccess__(r);
          }
        });
      }

      return promiseR;
    };
    return liftedF;
  }
  
  // module exports
  return {
    promise : promise,
    unit : unit,
    fmap : fmap,
    liftA : liftA,
  };
})();

module.exports = callbackless;
