
'use strict'
import TypeDetector from 'js-type-detector';

var id = 1;
const PERFIX = 'BINDER_STORE_';

function getId() {
    id++;
    return PERFIX + id;
}
class StorePublisher {
    constructor(context) {
        this.stores = {}
        this.listener;
        this._receviers = {

        };
    }
    setStores(stores) {
        if (!stores) {
            return;
        }
        this.release();
        if (TypeDetector.isArray(stores)) {
            stores.forEach((store) => {
               this._receviers[store.getStoreName()] =  store.addListener('change', () => {
                    this.publish();
                })
            })
        }
    }
    setListener(listener) {
        this.listener = listener;
    }
    release() {
        for(var key in this._receviers){
            this._receviers[key].remove();
        }
    }
    publish() {
        if (TypeDetector.isFunction(this.listener)) {
            this.listener();
        }
    }
}

function fackContextCreator(realContenxt) {
    function FakeContent() {
        this.props = Object.assign({}, realContenxt.props);
    };
    FakeContent.prototype = realContenxt;
    return new FakeContent();
}

function createClass(ReactComponent) {
    return class BinderComponent extends ReactComponent {
        constructor(props, context) {
            super(props, context);
            this._storePublisher = new StorePublisher(this);
            this._storePublisher.setStores(props.bind);
            this._storePublisher.setListener(() => {
                            console.log('sadfasd')

                this.forceUpdate()
            });
            this._isMounted = false;
            this._fakeContext = fackContextCreator(this);
        }
        _setPropsToFakeContext(props) {
            if (props.propsUpdater) {
                Object.assign(this._fakeContext.props,props, props.propsUpdater());
            }
        }
        shouldComponentUpdate(nextProps, nextState) {
            return true;
        }
        componentWillReceiveProps(nextProps) {
            this._storePublisher.setStores(nextProps.bind);
            super.componentWillReceiveProps && super.componentWillReceiveProps();
        }
        componentWillUpdate(nextProps, nextState) {
            this._setPropsToFakeContext(nextProps);
            super.componentWillUpdate && super.componentWillUpdate(nextProps, nextState);
        }
        
        componentDidMount() {
            this._isMounted = true;
            super.componentDidMount && super.componentDidMount();
        }
        componentWillUnmount() {
            this._isMounted = false;
            this._storePublisher.release();
            super.componentWillUnmount && super.componentWillUnmount();
        }
        render() {
            return super.render.call(this._fakeContext);
        }
    }
}
export default {
    createClass
}
