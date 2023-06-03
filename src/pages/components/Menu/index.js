import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link } from 'umi';
import { Menu, Tooltip, Button } from 'antd';
import { MailOutlined, HomeOutlined, InteractionOutlined, UserOutlined, BarsOutlined, DashboardOutlined, ThunderboltOutlined, FileTextOutlined, SettingOutlined, SearchOutlined, FormOutlined, AreaChartOutlined, AccountBookOutlined, BarChartOutlined, PrinterOutlined, ScheduleOutlined, ProfileOutlined, PullRequestOutlined, AlertOutlined, DesktopOutlined } from '@ant-design/icons';
import style from './Menu.css';

const { SubMenu } = Menu;
const IconsObj = {
    'global_monitor':<DesktopOutlined />,
    'ele_monitor_menu':<DashboardOutlined />,
    'agent_monitor':<DesktopOutlined />,
    'agent_company':<BarsOutlined />,
    'user_manage':<UserOutlined />,
    'energy_manage':<AccountBookOutlined />,
    'coal_manage':<InteractionOutlined />,
    'info_manage_menu':<FormOutlined />,
    'mach_manage':<PullRequestOutlined />,
    'system_log':<ProfileOutlined />,
    'ele_quality':<ThunderboltOutlined />,
    'energy_eff':<BarChartOutlined />,
    'alarm_manage':<AlertOutlined />,
    'stat_report':<FileTextOutlined />,
    'system_config':<SettingOutlined />,
    'analyze_manage':<SearchOutlined />
}

// let stationMaps = {
//     // 配电房子站
//     '83':'localhost:8100',
//     '121':'localhost:8003'
// }
let stationMaps = {
    // 配电房子站
    'power_room':'pr',
    'ai_gas_station':'acs',
    'ac_system':'ac',
}

const MenuComponent = ({user, dispatch})=>{
    const [openKeys, setOpenKeys] = useState([]);
    const { userMenu, currentMenu, currentPath, userInfo, company_id, currentProject, containerWidth, moguPath, collapsed, fromAgent, theme } = user;
    // console.log(currentMenu, currentPath);
    // let selectedKeys = currentMenu.children ? [currentMenu.children[0]+''] : [currentMenu.menu_id+''];
    // let openKeys = currentMenu.children ? [currentMenu.menu_id+''] : [currentMenu.parent+''];
    useEffect(()=>{
        setOpenKeys( currentMenu.children ? [currentMenu.menu_id + '' ] : [currentMenu.parent + '']);
    },[currentMenu]);

    let option = {
        mode:'inline',
        className: theme === 'dark' ? style['container'] + ' ' + style['dark'] : style['container'],
        selectedKeys:[currentMenu.menu_id + ''],
        inlineCollapsed:collapsed
    }
    if ( !collapsed ){
        option.openKeys = openKeys;
    }
    return (
            <Menu
                {...option}
            >                
                {
                    userMenu.map(item => (
                        item.child && item.child.length
                        ?
                        <SubMenu 
                            key={item.menu_id}
                            onTitleClick={()=>{
                                if ( openKeys.filter(i=>i == item.menu_id).length ) {
                                    setOpenKeys([]);
                                } else {
                                    setOpenKeys([item.menu_id + '']);   
                                }
                                // 能源成本 、 能源效率 、 报警监控三个模块直接跳转到相关主页
                                if ( item.menu_code === 'global_monitor' || item.menu_code === 'energy_manage' || item.menu_code === 'energy_eff' || item.menu_code === 'alarm_manage' || item.menu_code === 'ele_quality' ) {
                                    // dispatch(routerRedux.push(`/${currentProject}/${item.menu_code}`));
                                    history.push(`/${currentProject}/${item.menu_code}`);
                                } else {
                                    if ( item.child && item.child.length ) {
                                        history.push(`/${currentProject}/${item.menu_code}/${item.child[0].menu_code}`)
                                    }
                                } 
                                if ( item.menu_code === 'mogu_station'){
                                    
                                }                         
                            }}
                           
                            title={
                            <div>
                                { IconsObj[item.menu_code] }
                                <span className={style['menu-name']}>{ item.menu_name }</span>
                                <span className={style['arrow-button']}></span>
                            </div>
                        } >                      
                            {
                                item.child.map(sub => (
                                    
                                    <Menu.Item key={sub.menu_id}>
                                        {
                                            item.menu_code === 'global_monitor' 
                                            ?
                                            <Tooltip placement="right" title={                                               
                                                <Button type='primary' size='small' onClick={(e)=>{
                                                    // 监控中心下的子菜单是各种子站，可以跳转至相关项目首页
                                                    if ( stationMaps[sub.menu_code]){
                                                        e.stopPropagation();
                                                        // 兼容第三方服务商的location跳转
                                                        let temp = location.host.split('-');
                                                        let prefix = temp.length === 2 ? temp[1].split('.')[0] : '';
                                                        let linkPath = ( prefix ? stationMaps[sub.menu_code] + '-' + prefix : stationMaps[sub.menu_code] ) + '.h1dt.com';
                                                        window.open(`http://${linkPath}?pid=${Math.random()}&&userId=${userInfo.user_id}&&companyId=${company_id}&&mode=full`);
                                                    } else {
                                                        if ( sub.menu_code === 'ac_station') {
                                                            window.open('https://epc.cie-tech.cn/?TOKEN=5d24042b-669b-4798-a0b3-9802cc2e1e01');
                                                        }
                                                        if ( sub.menu_code === 'mogu_station') {
                                                            window.open(moguPath);
                                                        }
                                                    }                                       
                                                }}>{`进入${sub.menu_name}`}</Button>
                                            }>
                                                <Link to={`/${currentProject}/${item.menu_code}/${sub.menu_code}`} >{sub.menu_name}</Link>
                                            </Tooltip>
                                            :
                                            <Link to={`/${currentProject}/${item.menu_code}/${sub.menu_code}`} >{sub.menu_name}</Link>
                                        }
                                                                           
                                    </Menu.Item>
                                   
                                ))
                            }
                        </SubMenu>
                        :
                        <Menu.Item key={item.menu_id}>
                            { IconsObj[item.menu_code] }
                            <span>
                                <Link to={`/${currentProject}/${item.menu_code}`} >{ item.menu_name }</Link>
                            </span>
                        </Menu.Item>
                    ))
                }   
            </Menu>
    )
}

export default connect(({ user })=>({user }))(MenuComponent);