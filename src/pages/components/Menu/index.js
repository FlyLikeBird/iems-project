import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link } from 'umi';
import { Menu, Button } from 'antd';
import { MailOutlined, UserOutlined, BarsOutlined, DashboardOutlined, ThunderboltOutlined, FileTextOutlined, SettingOutlined, SearchOutlined, FormOutlined, AreaChartOutlined, AccountBookOutlined, BarChartOutlined, PrinterOutlined, ScheduleOutlined, ProfileOutlined, PullRequestOutlined, AlertOutlined, DesktopOutlined } from '@ant-design/icons';
import style from './Menu.css';

const { SubMenu } = Menu;
const IconsObj = {
    'global_monitor':<DesktopOutlined />,
    'ele_monitor_menu':<DashboardOutlined />,
    'agent_monitor':<DesktopOutlined />,
    'agent_company':<BarsOutlined />,
    'user_manage':<UserOutlined />,
    'energy_manage':<AccountBookOutlined />,
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

const MenuComponent = ({user, dispatch})=>{
    const [openKeys, setOpenKeys] = useState([]);
    const { userMenu, currentMenu, currentPath, currentProject, containerWidth, collapsed, theme } = user;
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
    // console.log(currentMenu);
    // console.log(currentProject);
    // console.log(userMenu);
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
                                        <Link to={`/${currentProject}/${item.menu_code}/${sub.menu_code}`} >{sub.menu_name}</Link>                                      
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