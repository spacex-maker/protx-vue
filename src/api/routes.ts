import { h } from "vue";
import { http } from "@/utils/http";

type Result = {
  success: boolean;
  message: string;
  data: Array<any>;
};

// 空白组件
const BlankComponent = () => h("div");

// 修改为你的菜单接口
export const getAsyncRoutes = () => {
  return http.request<Result>("get", "/manage/sys-menu/tree").then(res => {
    if (res.success) {
      return {
        success: true,
        data: convertMenuToPureAdmin(res.data)
      };
    }
    return res;
  });
};

// 转换菜单格式的函数
function convertMenuToPureAdmin(menus: any[]) {
  return menus
    .map(menu => {
      // 检查是否是有效的路由路径
      const isValidPath = menu.path && menu.path.startsWith("/");
      const isGroup = menu.component === "CNavGroup";
      const isTitle = menu.component === "CNavTitle";

      // 基础路由配置
      const result: any = {
        path: isValidPath ? menu.path : isGroup || isTitle ? "" : "/",
        name: menu.name,
        meta: {
          title: menu.name,
          icon: menu.icon,
          rank: menu.id,
          showLink: menu.status !== false,
          extraIcon: menu.badgeText
            ? {
                svg: true,
                name: menu.badgeText
              }
            : null
        }
      };

      // 处理组件
      if (isGroup) {
        // 如果是分组，使用空组件
        result.component = BlankComponent;
      } else if (isTitle) {
        // 如果是标题，使用空组件并设置特殊标记
        result.component = BlankComponent;
        result.meta.isTitle = true;
      } else {
        // 其他情况使用空白组件
        result.component = BlankComponent;
      }

      // 如果有子菜单，递归转换
      if (menu.children && menu.children.length > 0) {
        result.children = convertMenuToPureAdmin(menu.children);
      }

      return result;
    })
    .filter(Boolean); // 过滤掉可能的空值
}
