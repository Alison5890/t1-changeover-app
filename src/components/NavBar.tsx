import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/kitting', label: 'Kitting', icon: '📦' },
  { to: '/wip', label: 'WIP', icon: '📉' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/report', label: 'Report', icon: '📊' },
  { to: '/data', label: 'Data', icon: '🗄️' },
  { to: '/config', label: 'Config', icon: '⚙️' },
];

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex overflow-x-auto">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-2 text-xs font-medium transition-colors min-h-[56px] min-w-[52px] flex-1 ${
                isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <span className="text-lg leading-none mb-0.5">{tab.icon}</span>
            <span className="truncate w-full text-center text-[10px]">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
