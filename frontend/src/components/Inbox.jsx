import { Inbox } from '@novu/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { useEffect, useState } from 'react';

export default function Novu(props) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [key, setKey] = useState(0);

    // Force re-render when theme changes
    useEffect(() => {
        setKey(prev => prev + 1);
    }, [theme]);

    // Define appearance based on current theme
    const getAppearance = () => {
        if (theme === 'dark') {
            return {
                variables: {
                    colorPrimary: "#DD2450",
                    colorForeground: "#e5e7eb", // Light text for dark mode
                    colorBackground: "#111827", // Dark background
                    colorText: "#f3f4f6", // Light text
                    colorTextSecondary: "#d1d5db", // Secondary text
                    colorBorder: "#374151", // Border color
                    colorHover: "#1f2937", // Hover background
                    colorPressed: "#374151", // Pressed state
                    colorFocus: "#3b82f6", // Focus ring
                    colorSuccess: "#10b981",
                    colorWarning: "#f59e0b",
                    colorError: "#ef4444",
                    colorInfo: "#3b82f6",
                    borderRadius: "8px",
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "1.5",
                    spacing: "8px",
                    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }
            };
        } else {
            return {
                variables: {
                    colorPrimary: "#DD2450",
                    colorForeground: "#374151", // Dark text for light mode
                    colorBackground: "#ffffff", // Light background
                    colorText: "#111827", // Dark text
                    colorTextSecondary: "#6b7280", // Secondary text
                    colorBorder: "#e5e7eb", // Border color
                    colorHover: "#f9fafb", // Hover background
                    colorPressed: "#f3f4f6", // Pressed state
                    colorFocus: "#3b82f6", // Focus ring
                    colorSuccess: "#10b981",
                    colorWarning: "#f59e0b",
                    colorError: "#ef4444",
                    colorInfo: "#3b82f6",
                    borderRadius: "8px",
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "1.5",
                    spacing: "8px",
                    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }
            };
        }
    };

    return (
        <Inbox
            key={key}
            applicationIdentifier="r9zCT17TgOgF"
            subscriberId={props.userId}
            routerPush={(path) => navigate(path)}
            appearance={getAppearance()}
        />
    );
}