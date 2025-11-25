import React, { forwardRef, useEffect, useRef } from 'react';

interface CodePreviewProps {
  code: string;
}

export const CodePreview = forwardRef<HTMLIFrameElement, CodePreviewProps>(
  ({ code }, ref) => {
    // 전달받은 ref가 있으면 사용, 없으면 내부 ref 사용
    const innerRef = useRef<HTMLIFrameElement>(null);
    const iframeRef = (ref && typeof ref !== 'function' ? ref : innerRef) as React.RefObject<HTMLIFrameElement>;

    useEffect(() => {
      if (!code || !iframeRef.current) return;

      // 컴포넌트 이름 추출 (다양한 패턴 지원 - 한글 포함 수정됨)
      let componentName = 'App';

      // 패턴 1: export default function ComponentName (한글 지원)
      let match = code.match(/export\s+default\s+function\s+([^\s(]+)/);
      if (match) {
        componentName = match[1];
      } else {
        // 패턴 2: function ComponentName
        match = code.match(/function\s+([^\s(]+)\s*\(/);
        if (match) {
          componentName = match[1];
        } else {
          // 패턴 3: const ComponentName = () => {}
          match = code.match(/const\s+([^\s(]+)\s*=\s*\(/);
          if (match) {
            componentName = match[1];
          } else {
            // 패턴 4: export default ComponentName (마지막 줄)
            match = code.match(/export\s+default\s+([^\s;]+)\s*;?\s*$/);
            if (match) {
              componentName = match[1];
            }
          }
        }
      }

      console.log('Extracted component name:', componentName);

      // React import 제거, export default 제거, TypeScript 타입 완전 제거
      let cleanedCode = code
        .replace(/import\s+.*\s+from\s+['"]react['"];?/g, '')
        .replace(/import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"];?/g, '')
        .replace(/export\s+default\s+function\s+/g, 'function ')
        .replace(/export\s+default\s+\w+\s*;?\s*$/gm, '');

      // 🔥 [중복 선언 방지] React 구조 분해 할당 구문 제거
      // (이제 iframe 환경에서 제공하는 것을 사용함)
      cleanedCode = cleanedCode.replace(/const\s+\{[^}]+\}\s*=\s*React\s*;?/g, '');

      // TypeScript interface/type 정의 완전 제거
      cleanedCode = cleanedCode.replace(/interface\s+\w+\s*\{[^}]*\}/gs, '');
      cleanedCode = cleanedCode.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

      // 함수 파라미터의 타입 어노테이션 제거
      cleanedCode = cleanedCode.replace(/(\w+)\s*:\s*React\.\w+<[^>]*>/g, '$1');
      cleanedCode = cleanedCode.replace(/(\w+)\s*:\s*\w+<[^>]*>/g, '$1');

      // 변수 선언의 타입 어노테이션 제거
      cleanedCode = cleanedCode.replace(/:\s*\w+\[\]/g, '');
      cleanedCode = cleanedCode.replace(/:\s*(string|number|boolean|any|void)\b/g, '');

      // 제네릭 타입 제거
      cleanedCode = cleanedCode.replace(/useState<[^>]+>/g, 'useState');
      cleanedCode = cleanedCode.replace(/useRef<[^>]+>/g, 'useRef');

      console.log('Cleaned code:', cleanedCode);

      const encodedCode = btoa(unescape(encodeURIComponent(cleanedCode)));
      const encodedComponentName = btoa(unescape(encodeURIComponent(componentName)));
      const encodedErrorPreview = btoa(unescape(encodeURIComponent(cleanedCode.substring(0, 1000))));

      const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { width: 100vw; height: 100vh; }
    .error-display { 
      padding: 20px; 
      color: #dc2626; 
      background: #fef2f2;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      console.log('=== Iframe Execution Start ===');
      
      // 🔥 [수정됨] useRef 및 기타 Hooks 추가
      const { 
        useState, 
        useEffect, 
        useCallback, 
        useMemo, 
        useRef, 
        useReducer, 
        useContext, 
        useLayoutEffect 
      } = React;
      
      // Lucide Icons React 래퍼 생성
      const createLucideIcon = (iconName) => {
        return function(props = {}) {
          const ref = React.useRef(null); // 여기서는 React.useRef로 직접 사용 중이라 문제 없었음
          
          React.useEffect(() => {
            if (ref.current && window.lucide) {
              ref.current.innerHTML = '';
              const kebabName = iconName.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1);
              const icon = document.createElement('i');
              icon.setAttribute('data-lucide', kebabName);
              if (props.size) {
                icon.style.width = props.size + 'px';
                icon.style.height = props.size + 'px';
              }
              if (props.className) icon.className = props.className;
              if (props.color) icon.style.color = props.color;
              ref.current.appendChild(icon);
              window.lucide.createIcons({
                icons: { [kebabName]: window.lucide.icons[kebabName] }
              });
            }
          }, [props.size, props.className, props.color]);
          
          return React.createElement('span', { 
            ref, 
            style: { display: 'inline-flex', alignItems: 'center', ...props.style }
          });
        };
      };
      
      const iconNames = [
        'Search', 'Filter', 'Download', 'Upload', 'Plus', 'Minus', 'X', 
        'Check', 'ChevronLeft', 'ChevronRight', 'ChevronDown', 'ChevronUp',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Menu', 'Settings', 'User', 'Home', 'Calendar', 'Bell', 'Mail',
        'Edit', 'Trash', 'Save', 'Copy', 'Eye', 'EyeOff', 'Lock', 'Unlock',
        'AlertCircle', 'Info', 'HelpCircle', 'CheckCircle', 'XCircle',
        'Star', 'Heart', 'Share', 'Link', 'ExternalLink', 'File', 'Folder',
        'Image', 'Video', 'Music', 'Code', 'Database', 'Server', 'Cloud',
        'Wifi', 'Battery', 'Power', 'Zap', 'TrendingUp', 'TrendingDown',
        'BarChart', 'PieChart', 'Activity', 'Grid', 'List', 'Table',
        'Globe', 'MapPin', 'Phone', 'MessageSquare', 'Send', 'Printer',
        'Maximize', 'Minimize', 'RefreshCw', 'RotateCw', 'RotateCcw'
      ];
      
      iconNames.forEach(name => {
        window[name] = createLucideIcon(name);
      });
      
      // 코드 디코딩 및 실행
      const decodedCode = decodeURIComponent(escape(atob('${encodedCode}')));
      const componentNameToRender = decodeURIComponent(escape(atob('${encodedComponentName}')));
      
      console.log('Expected component name:', componentNameToRender);
      
      // Babel 변환
      let transformedCode;
      try {
        const transformed = Babel.transform(decodedCode, {
          presets: ['react'],
          filename: 'component.jsx'
        });
        transformedCode = transformed.code;
      } catch (error) {
        console.error('❌ Babel transformation failed:', error);
        throw error;
      }
      
      // window 등록 스니펫 추가
      transformedCode = transformedCode + 
        '\\n(function registerComponent() {' +
        '\\n  try {' +
        '\\n    if (typeof ' + componentNameToRender + ' !== \\\"undefined\\\") {' +
        '\\n      window.' + componentNameToRender + ' = ' + componentNameToRender + ';' +
        '\\n      console.log(\\\"Component registered on window:\\\", \\\"' + componentNameToRender + '\\\");' +
        '\\n    } else {' +
        '\\n      console.error(\\\"Component not defined after execution:\\\", \\\"' + componentNameToRender + '\\\");' +
        '\\n    }' +
        '\\n  } catch (error) {' +
        '\\n    console.error(\\\"Component registration failed:\\\", error);' +
        '\\n  }' +
        '\\n})();\\n';
      
      // 실행
      const scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.textContent = transformedCode;
      
      scriptTag.onerror = (error) => {
        console.error('❌ Script execution error:', error);
      };
      
      document.body.appendChild(scriptTag);
      
      // 렌더링 대기 루프
      let attempts = 0;
      const maxAttempts = 50; 
      
      const tryRender = () => {
        attempts++;
        
        if (typeof window[componentNameToRender] !== 'undefined') {
          try {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(window[componentNameToRender]));
            console.log('=== Iframe Execution Success ===');
          } catch (error) {
            console.error('=== Rendering Error ===', error);
            const codePreview = decodeURIComponent(escape(atob('${encodedErrorPreview}')));
            document.getElementById('root').innerHTML = 
              '<div class="error-display">' +
              '<h3>⚠️ Rendering Error</h3>' +
              '<p><strong>Error:</strong> ' + (error.message || 'Unknown error') + '</p>' +
              '<p><strong>Component:</strong> ' + componentNameToRender + '</p>' +
              '<details><summary>Stack Trace</summary><pre>' + (error.stack || 'No stack trace') + '</pre></details>' +
              '<details><summary>Code Preview (first 1000 chars)</summary><pre>' + codePreview + '</pre></details>' +
              '</div>';
          }
        } else if (attempts < maxAttempts) {
          setTimeout(tryRender, 100);
        } else {
          console.error('=== Component Not Found After Max Attempts ===');
          
          // eval 시도
          try {
            const func = eval(componentNameToRender);
            if (typeof func === 'function') {
              window[componentNameToRender] = func;
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(React.createElement(window[componentNameToRender]));
              return;
            }
          } catch (e) {}
          
          const codePreview = decodeURIComponent(escape(atob('${encodedErrorPreview}')));
          const available = Object.keys(window).filter(k => k[0] === k[0].toUpperCase()).join(', ');
          document.getElementById('root').innerHTML = 
            '<div class="error-display">' +
            '<h3>⚠️ Component Not Found</h3>' +
            '<p><strong>Component:</strong> ' + componentNameToRender + '</p>' +
            '<p><strong>Available:</strong> ' + available + '</p>' +
            '<details><summary>Code Preview (first 1000 chars)</summary><pre>' + codePreview + '</pre></details>' +
            '</div>';
        }
      };
      
      setTimeout(tryRender, 100);
    } catch (error) {
      console.error('=== Setup Error ===', error);
      document.getElementById('root').innerHTML = 
        '<div class="error-display">' +
        '<h3>⚠️ Setup Error</h3>' +
        '<p>' + (error.message || 'Unknown error') + '</p>' +
        '</div>';
    }
  </script>
</body>
</html>`;

      if (iframeRef.current) {
        iframeRef.current.srcdoc = htmlContent;
      }
    }, [code]);

    if (!code) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
          <p className="text-gray-500">코드를 생성하여 프로토타입을 확인하세요.</p>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 w-full h-full">
        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }
);