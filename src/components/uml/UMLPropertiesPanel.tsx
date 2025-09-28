// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface UMLPropertiesPanelProps {
  selectedElement: any;
  onElementUpdate: (elementId: string, updates: any) => void;
  onElementDelete: () => void;
}

export function UMLPropertiesPanel({ 
  selectedElement, 
  onElementUpdate, 
  onElementDelete 
}: UMLPropertiesPanelProps) {
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    type: 'String',
    visibility: 'private',
    defaultValue: ''
  });
  const [newMethod, setNewMethod] = useState({
    name: '',
    returnType: 'void',
    visibility: 'public',
    parameters: []
  });

  if (!selectedElement) {
    return (
      <div className="p-6 text-center text-slate-500">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
            <Edit className="h-8 w-8" />
          </div>
        </div>
        <h3 className="font-medium mb-2">Sin selección</h3>
        <p className="text-sm">Selecciona un elemento para ver sus propiedades</p>
      </div>
    );
  }

  const handleNameChange = (name: string) => {
    onElementUpdate(selectedElement.id, { name });
  };

  const handlePackageChange = (packageName: string) => {
    onElementUpdate(selectedElement.id, { packageName });
  };

  const handleTypeChange = (classType: string) => {
    onElementUpdate(selectedElement.id, { classType });
  };

  const handleAddAttribute = () => {
    if (!newAttribute.name.trim()) return;

    const updatedAttributes = [...(selectedElement.attributes || []), {
      id: Date.now().toString(),
      ...newAttribute
    }];

    onElementUpdate(selectedElement.id, { attributes: updatedAttributes });
    setNewAttribute({ name: '', type: 'String', visibility: 'private', defaultValue: '' });
  };

  const handleUpdateAttribute = (index: number, updates: any) => {
    const updatedAttributes = [...selectedElement.attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], ...updates };
    onElementUpdate(selectedElement.id, { attributes: updatedAttributes });
  };

  const handleRemoveAttribute = (index: number) => {
    const updatedAttributes = selectedElement.attributes.filter((_, i) => i !== index);
    onElementUpdate(selectedElement.id, { attributes: updatedAttributes });
  };

  const handleAddMethod = () => {
    if (!newMethod.name.trim()) return;

    const updatedMethods = [...(selectedElement.methods || []), {
      id: Date.now().toString(),
      ...newMethod
    }];

    onElementUpdate(selectedElement.id, { methods: updatedMethods });
    setNewMethod({ name: '', returnType: 'void', visibility: 'public', parameters: [] });
  };

  const handleUpdateMethod = (index: number, updates: any) => {
    const updatedMethods = [...selectedElement.methods];
    updatedMethods[index] = { ...updatedMethods[index], ...updates };
    onElementUpdate(selectedElement.id, { methods: updatedMethods });
  };

  const handleRemoveMethod = (index: number) => {
    const updatedMethods = selectedElement.methods.filter((_, i) => i !== index);
    onElementUpdate(selectedElement.id, { methods: updatedMethods });
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            Información General
            <Badge variant="outline" className="text-xs">
              {selectedElement.classType}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="element-name" className="text-xs">Nombre</Label>
            <Input
              id="element-name"
              value={selectedElement.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="element-package" className="text-xs">Paquete</Label>
            <Input
              id="element-package"
              value={selectedElement.packageName || ''}
              onChange={(e) => handlePackageChange(e.target.value)}
              placeholder="com.example.model"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="element-type" className="text-xs">Tipo</Label>
            <Select value={selectedElement.classType} onValueChange={handleTypeChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLASS">Clase</SelectItem>
                <SelectItem value="INTERFACE">Interfaz</SelectItem>
                <SelectItem value="ABSTRACTCLASS">Clase Abstracta</SelectItem>
                <SelectItem value="ENUM">Enumeración</SelectItem>
                <SelectItem value="RECORD">Record</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">Posición X</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.positionX)}
                onChange={(e) => onElementUpdate(selectedElement.id, { positionX: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Posición Y</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.positionY)}
                onChange={(e) => onElementUpdate(selectedElement.id, { positionY: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>

          <Button 
            onClick={onElementDelete} 
            variant="destructive" 
            size="sm" 
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Elemento
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Atributos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedElement.attributes?.map((attr, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  {attr.visibility === 'public' ? '+' : attr.visibility === 'private' ? '-' : '#'} {attr.name}
                </div>
                <div className="text-xs text-slate-500">
                  {attr.type}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAttribute(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          <div className="space-y-2 p-2 bg-slate-50 rounded">
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del atributo"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1"
              />
              <Select 
                value={newAttribute.visibility} 
                onValueChange={(value) => setNewAttribute(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">+</SelectItem>
                  <SelectItem value="private">-</SelectItem>
                  <SelectItem value="protected">#</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Tipo"
                value={newAttribute.type}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, type: e.target.value }))}
                className="flex-1"
              />
              <Button onClick={handleAddAttribute} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métodos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedElement.methods?.map((method, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  {method.visibility === 'public' ? '+' : method.visibility === 'private' ? '-' : '#'} {method.name}()
                </div>
                <div className="text-xs text-slate-500">
                  → {method.returnType}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMethod(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          <div className="space-y-2 p-2 bg-slate-50 rounded">
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del método"
                value={newMethod.name}
                onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1"
              />
              <Select 
                value={newMethod.visibility} 
                onValueChange={(value) => setNewMethod(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">+</SelectItem>
                  <SelectItem value="private">-</SelectItem>
                  <SelectItem value="protected">#</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Tipo de retorno"
                value={newMethod.returnType}
                onChange={(e) => setNewMethod(prev => ({ ...prev, returnType: e.target.value }))}
                className="flex-1"
              />
              <Button onClick={handleAddMethod} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
