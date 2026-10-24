import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
    token: {
        // --- 1. Brand Colors (Primary Palette) ---
        colorPrimary: '#1677ff',
        colorPrimaryHover: '#4096ff',
        colorPrimaryActive: '#0958d9',
        colorPrimaryBg: '#e6f4ff',
        colorPrimaryBgHover: '#bae0ff',
        colorPrimaryBorder: '#91caff',

        // --- 2. Global Backgrounds & Text ---
        colorBgContainer: '#ffffff',
        colorBgContainerDisabled: 'rgba(0, 0, 0, 0.04)',
        colorText: 'rgba(0, 0, 0, 0.88)',
        colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
        colorTextLightSolid: '#ffffff',

        // --- 3. Error Validation Colors ---
        colorError: '#ff4d4f',
        colorErrorHover: '#ff7875',
        colorErrorActive: '#d9363e',
        colorErrorBg: '#fff2f0',
        colorErrorBgActive: '#ffccc7',

        // --- 4. Hyperlink Colors (Link Button / Anchor) ---
        colorLink: '#1677ff',
        colorLinkHover: '#69b1ff',
        colorLinkActive: '#0958d9',

        // --- 5. Global Typography ---
        fontSize: 14,

        // --- 6. Borders & Layout Shapes ---
        borderRadius: 6,
        borderRadiusLG: 8,
        borderRadiusSM: 4,
        lineType: 'solid',
        lineWidth: 1,
        lineWidthFocus: 3,

        // --- 7. Control Heights (Component Thickness) ---
        controlHeight: 32,
        controlHeightLG: 40,
        controlHeightSM: 24,

        // --- 8. Animation & Motion Speeds ---
        motionDurationMid: '0.2s',
        motionDurationSlow: '0.3s',
        motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        opacityLoading: 0.65,

        // --- Global Icon Colors ---
        colorIcon: 'rgba(0, 0, 0, 0.45)',
        colorIconHover: 'rgba(0, 0, 0, 0.88)',
    },
    components: {
        Input: {
            // --- 1. Default State ---
            colorBgContainer: '#ffffff',
            colorBorder: '#d9d9d9',
            colorText: 'rgba(0, 0, 0, 0.88)',
            colorTextPlaceholder: 'rgba(0, 0, 0, 0.25)',

            // --- 2. Hover & Focus States ---
            hoverBorderColor: '#4096ff', 
            activeBorderColor: '#1677ff', 
            activeShadow: '0 0 0 2px rgba(5, 145, 255, 0.1)', 

            // --- 3. Disabled State ---
            colorBgContainerDisabled: 'rgba(0, 0, 0, 0.04)',
            colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
            
            // --- 4. Error Validation State ---
            colorError: '#ff4d4f',
            colorErrorHover: '#ff7875',
            errorActiveShadow: '0 0 0 2px rgba(255, 38, 5, 0.06)', 

            // --- 5. Warning Validation State ---
            colorWarning: '#faad14',
            colorWarningHover: '#ffd666',
            warningActiveShadow: '0 0 0 2px rgba(255, 215, 5, 0.1)', 
        },
        Select: {
            // --- 1. Selector Box (Normal State) ---
            selectorBg: '#ffffff', 
            colorBorder: '#d9d9d9', 
            colorText: 'rgba(0, 0, 0, 0.88)',
            colorTextPlaceholder: 'rgba(0, 0, 0, 0.25)',
            colorIcon: 'rgba(0, 0, 0, 0.45)',
            colorIconHover: 'rgba(0, 0, 0, 0.88)',

            // --- 2. Hover & Focus States ---
            hoverBorderColor: '#4096ff',
            activeBorderColor: '#1677ff',
            activeOutlineColor: 'rgba(5, 145, 255, 0.1)', 

            // --- 3. Disabled State ---
            multipleSelectorBgDisabled: 'rgba(0, 0, 0, 0.04)', 
            colorTextDisabled: 'rgba(0, 0, 0, 0.25)',

            // --- 4. Error Validation State ---
            colorError: '#ff4d4f',
            colorErrorBorderHover: '#ffa39e', 
            colorErrorOutline: 'rgba(255, 38, 5, 0.06)',

            // --- 5. Warning Validation State ---
            colorWarning: '#faad14',
            colorWarningHover: '#ffd666',
            colorWarningOutline: 'rgba(255, 215, 5, 0.1)',

            // --- 6. Dropdown Menu & Options List ---
            colorBgElevated: '#ffffff',
            optionActiveBg: 'rgba(0, 0, 0, 0.04)',
            optionSelectedBg: '#e6f4ff',
            optionSelectedColor: 'rgba(0, 0, 0, 0.88)',
            optionSelectedFontWeight: 600,
        },
        Button: {
            // --- 1. Primary Button ---
            primaryColor: '#ffffff',
            primaryShadow: '0 2px 0 rgba(5, 145, 255, 0.1)',
            solidTextColor: '#ffffff',

            // --- 2. Default Button ---
            defaultBg: '#ffffff',
            defaultBorderColor: '#d9d9d9',
            defaultColor: 'rgba(0, 0, 0, 0.88)',
            defaultShadow: '0 2px 0 rgba(0, 0, 0, 0.02)',

            // --- 3. Default Button - Hover & Active States ---
            defaultHoverBg: '#ffffff',
            defaultHoverBorderColor: '#4096ff',
            defaultHoverColor: '#4096ff',
            defaultActiveBg: '#ffffff',
            defaultActiveBorderColor: '#0958d9',
            defaultActiveColor: '#0958d9',

            // --- 4. Danger Button ---
            dangerColor: '#ffffff',
            dangerShadow: '0 2px 0 rgba(255, 38, 5, 0.06)',

            // --- 5. Ghost Button ---
            ghostBg: 'transparent',
            defaultGhostBorderColor: '#ffffff',
            defaultGhostColor: '#ffffff',

            // --- 6. Text Button ---
            textTextColor: 'rgba(0, 0, 0, 0.88)',
            textHoverBg: 'rgba(0, 0, 0, 0.04)',
            textTextHoverColor: 'rgba(0, 0, 0, 0.88)',
            textTextActiveColor: 'rgba(0, 0, 0, 0.88)',

            // --- 7. Link Button ---
            linkHoverBg: 'transparent',

            // --- 8. Disabled State ---
            dashedBgDisabled: 'rgba(0, 0, 0, 0.04)',
            defaultBgDisabled: 'rgba(0, 0, 0, 0.04)',

            // --- 9. Typography & Layout ---
            fontWeight: 400,
            contentFontSize: 14,
            contentFontSizeLG: 16,
            contentFontSizeSM: 14,
            iconGap: 8,
            paddingInline: 15,
            paddingInlineLG: 15,
            paddingInlineSM: 7,

            // --- 10. Only Icon Button ---
            onlyIconSize: 'inherit',
            onlyIconSizeLG: 'inherit',
            onlyIconSizeSM: 'inherit',
        },
        Modal: {
            // --- 1. Backgrounds & Body ---
            contentBg: '#ffffff',
            headerBg: 'transparent',
            footerBg: 'transparent',
            colorBgMask: 'rgba(0, 0, 0, 0.45)',

            // --- 2. Typography & Colors ---
            titleColor: 'rgba(0, 0, 0, 0.88)',
            titleFontSize: 16,
            titleLineHeight: 1.5,

            // --- 3. Layout & Dimensions ---
            paddingMD: 24,
            paddingContentHorizontalLG: 24,
            borderRadiusLG: 8,
            marginXS: 8,
        },
    },
};