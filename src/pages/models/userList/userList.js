import { getUserList, getRoleList, createUser, editUser, deleteUser, getRolePermission, editRolePermission } from '../../services/userListService';
import { md5 } from '../../utils/encryption';

const initialState = {
    list:[],
    // 角色权限相关状态
    roleList:[],
    currentRole:{},
    selectedKeys:[],
    // -- --
    userForm:{},
    total:0,
    isLoading:false,
    // 新增用户和更改用户的模态弹窗
    visible:false,
    forEdit:false,
    selectedRowKeys:[],
    treeLoading:false,
    
}

export default {
    namespace:'userList',
    state:initialState,
    effects:{
        *fetchUserList(action, { call, put, select}){  
            let { user:{ company_id, pagesize }} = yield select();
            let { pageNum } = action.payload || {};
            let { data } = yield call(getUserList, { company_id, page:pageNum, pagesize });
            if ( data && data.code ==0){
                yield put({type:'getUserList', payload:{ data : data.data, count:data.count }});
            }       
        },
        *fetchRoleList(action, { call, put }){
            let { data} = yield call(getRoleList);
            if (data &&data.code ==0){
                yield put({type:'getRoleList', payload:{data:data.data}});
            }
        },
        *fetchRolePermission(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { currentRole } = action.payload || {};
                let { data } = yield call(getRolePermission, { company_id, role_id:currentRole.role_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getPermissionResult', payload:{ data:data.data, currentRole }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *editRolePermission(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { currentRole, menu_data, resolve, reject } = action.payload || {};
                let { data } = yield call(editRolePermission, { company_id, role_id:currentRole.role_id, menu_data });
                if ( data && data.code === '0'){
                    yield put({ type:'fetchRolePermission', payload:{ currentRole }});
                    if ( resolve && typeof resolve === 'function' ) resolve('权限设置成功');
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *add(action, { call, put, select }){
            let { user:{ company_id }} = yield select();
            let { values, resolve, reject, forEdit } = action.payload;
            values.is_actived = values.is_actived ? '1' : '0'; 
            values.company_id = company_id;
            values.confirm_password = values.password = md5(values.password, values.user_name);
            let { data } = yield call( forEdit ? editUser : createUser,values);
            if ( data && data.code == 0 ){
                yield put({type:'fetchUserList'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *delete(action, { call, put, select}){
            let { userList : { selectedRowKeys }} = yield select();
            let { data } = yield call(deleteUser, { user_id : selectedRowKeys});
            if ( data && data.code == 0 ){
                yield put({type:'fetchUserList'});
            }
        },
        
    },
    reducers:{
        toggleLoading(state, { payload}){
            return { ...initialState, roleList:state.roleList, isLoading:true }
        },
        toggleTreeLoading(state){
            return { ...state, treeLoading:true };
        },
        getUserList(state, {payload:{ data, count }}){
            // //  排除登录的自身账号，只显示下级有管理权限的企业用户列表
            // let list = data.users.filter(user=>user.user_id != localStorage.getItem('user_id'));
            return { ...state, list:data.users, total:count, isLoading:false } ;
        },
        getRoleList(state, { payload:{data}}){
            let { roles } = data;
            return { ...state, roleList:roles };
        },
        toggleVisible(state, { payload }){
            let { visible, forEdit, userForm } = payload;
            return { ...state, visible, forEdit, userForm:userForm ? userForm : {}};
        },
        select(state, { payload }){
            return { ...state, selectedRowKeys:payload };
        },
        getPermissionResult(state, { payload:{ data, currentRole }}){
            return { ...state, selectedKeys:data.menuList, currentRole };
        },
        setPermission(state, { payload:{ selectedKeys }}){
            return { ...state, selectedKeys };
        },
        resetRoleManager(state){
            return { ...state, roleList:[], currentRole:{}, selectedKeys:[] };
        },
        resetAdminManager(state){
            return { ...initialState, roleList:state.roleList, currentRole:state.currentRole, selectedKeys:state.selectedKeys };
        }
    }
}