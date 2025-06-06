import React from 'react'; 
import { Box, Typography, Link, Divider } from '@mui/material'; 
import { Phone, Code } from '@mui/icons-material'; 
 
const DeveloperInfo: React.FC = () =
  return ( 
    <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}> 
      <Divider sx={{ mb: 1 }} /> 
      <Box sx={{ textAlign: 'center' }}> 
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}> 
          <Code fontSize="small" /> 
          ?????: ???? ????? 
        </Typography> 
        <Link href="tel:01063864546" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, textDecoration: 'none' }}> 
          <Phone fontSize="small" /> 
          <Typography variant="caption" color="primary"> 
            01063864546 
          </Typography> 
        </Link> 
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}> 
          c 2024 ????????? ??? 
        </Typography> 
      </Box> 
    </Box> 
  ); 
}; 
 
export default DeveloperInfo; 
