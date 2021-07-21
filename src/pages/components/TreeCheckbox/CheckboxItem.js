import React, { Component } from 'react';
import { Checkbox } from 'antd';
import style from './Checkbox.css';

import { selectArr } from '../../utils/array';

const CheckboxGroup = Checkbox.Group;

class CheckboxItem extends Component {
    constructor(props){
        super();
        let optionArr = props.menu.child.map(item=>item.menu_id);
        let checkedList = selectArr(props.selectedMenu, optionArr);
        console.log(optionArr);
        console.log(checkedList);
        this.state = {
            checkedList,
            optionArr,
            checkAll: checkedList.length === optionArr.length,
            indeterminate: !!checkedList.length &&  checkedList.length < optionArr.length
        };
    }

    onCheckAll(e){
        let { menu, onAdd } = this.props;
        let { optionArr } = this.state;
        this.setState({
            checkedList: e.target.checked ? optionArr : [],
            checkAll:e.target.checked,
            indeterminate:false
        });
        if(e.target.checked){
            onAdd({ addArr:optionArr, isAdd:true, deleteArr:[]});
        } else {
            onAdd( { addArr:[], isAdd:false, deleteArr:optionArr });
        }
    }

    onChange(checkedValue){        
        let deleteArr = this.state.optionArr.filter(id=>{
            return !checkedValue.includes(id);
        });
        this.setState({
            checkedList:checkedValue,
            indeterminate: !!checkedValue.length && checkedValue.length != this.state.optionArr.length ? true : false ,
            checkAll: !!checkedValue.length ? true : false 
        });
        this.props.onAdd( { addArr:checkedValue, isAdd:false, deleteArr } ); 
    }

    render(){
        let { menu } = this.props;
        menu.child = menu.child.map(item=>{
            item.label = item.menu_name;
            item.value = item.menu_id;
            return item;
        });
        let { checkedList, indeterminate, checkAll } = this.state;
        return (
            
                <div className={style.item}>
                    <div className={style['sum-button']}>
                        <Checkbox
                          indeterminate={indeterminate}
                          onChange={this.onCheckAll.bind(this)}
                          checked={checkAll}
                        >
                          {menu.menu_name}
                        </Checkbox>
                    </div>
                    <CheckboxGroup
                      options={menu.child}
                      value={checkedList}
                      onChange={this.onChange.bind(this)}
                    />                    
                </div>
           
        )
    }
}
    
export default CheckboxItem;
