import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  Visibility,
  PersonAdd,
  Male,
  Female,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { RootState, AppDispatch } from '../../store/store';
import { getMembers } from '../../store/slices/membersSlice';

const Members: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { members, pagination, isLoading } = useSelector((state: RootState) => state.members);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    dispatch(getMembers({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      search: searchTerm,
    }));
  }, [dispatch, paginationModel, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleViewMember = (id: string) => {
    navigate(`/members/${id}`);
  };

  const getStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? 'نشط' : 'غير نشط'}
      color={isActive ? 'success' : 'default'}
      size="small"
    />
  );

  const getGenderIcon = (gender: string) => (
    gender === 'male' ? (
      <Male sx={{ color: '#1976d2', fontSize: 20 }} />
    ) : (
      <Female sx={{ color: '#d81b60', fontSize: 20 }} />
    )
  );

  const columns: GridColDef[] = [
    {
      field: 'member_number',
      headerName: 'رقم العضوية',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'full_name',
      headerName: 'الاسم الكامل',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'رقم الهاتف',
      width: 130,
    },
    {
      field: 'gender',
      headerName: 'الجنس',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getGenderIcon(params.value)}
        </Box>
      ),
    },
    {
      field: 'join_date',
      headerName: 'تاريخ الانضمام',
      width: 130,
      renderCell: (params) => (
        new Date(params.value).toLocaleDateString('ar-SA')
      ),
    },
    {
      field: 'is_active',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="عرض التفاصيل">
            <IconButton
              size="small"
              onClick={() => handleViewMember(params.row.id)}
              color="primary"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="تعديل">
            <IconButton
              size="small"
              onClick={() => navigate(`/members/${params.row.id}/edit`)}
              color="secondary"
            >
              <Edit />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          إدارة الأعضاء
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate('/members/new')}
          sx={{ borderRadius: 2 }}
        >
          إضافة عضو جديد
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="البحث بالاسم، رقم الهاتف، أو رقم العضوية..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Chip label={`إجمالي الأعضاء: ${pagination?.total_items || 0}`} color="primary" />
                <Chip label={`الأعضاء النشطين: ${members?.filter(m => m.is_active).length || 0}`} color="success" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={members || []}
            columns={columns}
            loading={isLoading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            rowCount={pagination?.total_items || 0}
            paginationMode="server"
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #e0e0e0',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#fafafa',
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Members;
