import { getUserList, getRoleList, createUser, deleteUser, getUserPermission, setUserPermission } from '../../services/userListService';

export default {
    namespace:'permission',
    state:{
        visible:false,
        selectedMenu:[],
        current:'',
        isLoading:false
    },   
    effects:{
        *fetch(action,{call, put, select}){
            let { permission : { current }} = yield select();
            yield put({type:'toggleLoading'});
            let { data } = yield call(getUserPermission, { user_id:current });
            if ( data && data.code ==0){
                yield put({type:'get', payload:{data:data.data }});
            }
        },
        *set(action, { call, put, select }){
            let { permission : { selectedMenu, current } } = yield select();
            let { data } = yield call(setUserPermission, { menu_data:selectedMenu, user_id : current });
            if (data && data.code ==0){
                yield put({type:'toggleVisible', payload:{ user_id:'', visible:false }});
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        get(state, { payload:{data, user_id}} ){
            let { menuList } = data;
            return { ...state, selectedMenu:menuList, isLoading:false };
        },
        changePermission(state, { payload }){
            let { addArr, isAdd, deleteArr } = payload;
            if (isAdd){
                return { ...state, selectedMenu:Array.from(new Set(state.selectedMenu.concat( addArr )))};
            } else {
                // 从selectMenu 删除未选中的复选框   
                // console.log(payload);
                // console.log(deleteArr);
                // console.log(removeItemById(Array.from(new Set(state.selectMenu.concat(payload))), deleteArr));
                let result = removeItemById(Array.from(new Set(state.selectedMenu.concat( addArr ))), deleteArr);
                console.log(deleteArr);
                console.log(result);
                return { ...state, selectedMenu:result };
            }           
        },
        toggleVisible(state, { payload }){
            let { user_id, visible } = payload;
            return { ...state, visible, current:user_id };
        }
    }
}

function removeItemById(arr1,arr2){
    for(let i=0;i<arr2.length;i++){
      for(let j=0;j<arr1.length;j++){
        if(arr2[i]== arr1[j]){
          // console.log('输出重复的内容====》',arr1[j],'输出在父数组中的下标=====>', arr1.indexOf(arr1[j]),);
          let indexs = arr1.indexOf(arr1[j]);
          arr1.splice(indexs, 1);
        }
      }
    }
    return arr1
  }