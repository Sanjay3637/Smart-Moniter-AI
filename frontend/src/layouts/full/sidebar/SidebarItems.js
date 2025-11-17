import React from 'react';
import Menuitems from './MenuItems';
import { useLocation } from 'react-router';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup/NavGroup';
import { useSelector } from 'react-redux';

const SidebarItems = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const pathDirect = pathname;

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {Menuitems.map((item) => {
          // Handle role-based visibility
          if (userInfo.role === 'student') {
            // Hide teacher-specific items from students
            if (['Create Exam', 'Add Questions', 'Manage Exams', 'Assign Exam', 'Exam Logs'].includes(item.title)) {
              return null;
            }
          } else if (userInfo.role === 'teacher') {
            // Hide student-specific items from teachers
            if (['My Tasks', 'My Results'].includes(item.title)) {
              return null;
            }
          }
          // {/********SubHeader**********/}
          if (item.subheader) {
            // Check if the user is a student and if the subheader should be hidden
            if (userInfo.role === 'student' && item.subheader === 'Teacher') {
              return null; // Don't render the "Teacher" subheader for students
            }

            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            return <NavItem item={item} key={item.id} pathDirect={pathDirect} />;
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
