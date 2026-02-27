#!/bin/bash

# Script to generate a new feature module with standard structure
# Usage: ./scripts/generate-module.sh <module-name> <entity-name>
# Example: ./scripts/generate-module.sh kegiatan-rba KegiatanRBA

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./scripts/generate-module.sh <module-name> <entity-name>"
  echo "Example: ./scripts/generate-module.sh kegiatan-rba KegiatanRBA"
  exit 1
fi

MODULE_NAME=$1
ENTITY_NAME=$2
MODULE_DIR="src/features/$MODULE_NAME"
ENTITY_LOWER=$(echo $ENTITY_NAME | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

# Create module directory
mkdir -p "$MODULE_DIR/components"
mkdir -p "$MODULE_DIR/hooks"

echo "Creating module: $MODULE_NAME"
echo "Entity: $ENTITY_NAME"
echo "Directory: $MODULE_DIR"

# Create index.ts
cat > "$MODULE_DIR/index.ts" << EOF
export { default as $ENTITY_NAME } from './$ENTITY_NAME';
export * from './types';
export * from './api';
EOF

# Create types.ts
cat > "$MODULE_DIR/types.ts" << EOF
export interface $ENTITY_NAME {
  id: string;
  // TODO: Add fields
  createdAt: string;
  updatedAt: string;
}

export interface Create${ENTITY_NAME}Dto {
  // TODO: Add create fields
}

export interface Update${ENTITY_NAME}Dto extends Partial<Create${ENTITY_NAME}Dto> {}
EOF

# Create api.ts
cat > "$MODULE_DIR/api.ts" << EOF
import { apiClient } from '@/lib/api-client';
import type { $ENTITY_NAME, Create${ENTITY_NAME}Dto, Update${ENTITY_NAME}Dto } from './types';

const ENDPOINT = '/$ENTITY_LOWER';

export const ${ENTITY_LOWER}Api = {
  getAll: async () => {
    const response = await apiClient.get<$ENTITY_NAME[]>(ENDPOINT);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<$ENTITY_NAME>(\`\${ENDPOINT}/\${id}\`);
    return response.data;
  },

  create: async (data: Create${ENTITY_NAME}Dto) => {
    const response = await apiClient.post<$ENTITY_NAME>(ENDPOINT, data);
    return response.data;
  },

  update: async (id: string, data: Update${ENTITY_NAME}Dto) => {
    const response = await apiClient.patch<$ENTITY_NAME>(\`\${ENDPOINT}/\${id}\`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(\`\${ENDPOINT}/\${id}\`);
  },
};
EOF

# Create main component
cat > "$MODULE_DIR/$ENTITY_NAME.tsx" << EOF
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { ${ENTITY_LOWER}Api } from './api';
import { queryClient } from '@/lib';

export default function $ENTITY_NAME() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['$ENTITY_LOWER'],
    queryFn: ${ENTITY_LOWER}Api.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: ${ENTITY_LOWER}Api.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['$ENTITY_LOWER']);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">$ENTITY_NAME</h1>
          <p className="text-gray-600">Kelola data $ENTITY_LOWER</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Baru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar $ENTITY_NAME</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  {/* TODO: Add more columns */}
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items && items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      {/* TODO: Add more cells */}
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
EOF

echo "✅ Module created successfully!"
echo ""
echo "Files created:"
echo "  - $MODULE_DIR/index.ts"
echo "  - $MODULE_DIR/types.ts"
echo "  - $MODULE_DIR/api.ts"
echo "  - $MODULE_DIR/$ENTITY_NAME.tsx"
echo ""
echo "Next steps:"
echo "  1. Update types.ts with actual fields"
echo "  2. Update api.ts endpoint if needed"
echo "  3. Update $ENTITY_NAME.tsx component with actual UI"
echo "  4. Add route in src/routes/index.tsx"
echo "  5. Add to sidebar in src/components/layout/Sidebar.tsx"
