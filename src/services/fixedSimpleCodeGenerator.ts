/**
 * Fixed generateService method without any placeholders
 */

interface GeneratedFile {
  name?: string;
  path?: string;
  content: string;
  language?: string;
}

interface Config {
  name: string;
  groupId: string;
}

class FixedCodeGenerator {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Generar Service - VERSION CORREGIDA SIN PLACEHOLDERS
   */
  private generateService(className: string, nodeData: any): GeneratedFile {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `${this.config.groupId}.${cleanProjectName}.service`;
    const entityPackage = `${this.config.groupId}.${cleanProjectName}.entity`;
    const dtoPackage = `${this.config.groupId}.${cleanProjectName}.dto`;
    const repoPackage = `${this.config.groupId}.${cleanProjectName}.repository`;
    
    const attributes = nodeData.properties || nodeData.attributes || [];
    
    // Generate getter/setter mappings for DTO conversion
    const dtoMappings = attributes.map((attr: any) => {
        const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
        return `        dto.set${capitalizedName}(entity.get${capitalizedName}());`;
    }).join('\n');
    
    const entityMappings = attributes.map((attr: any) => {
        const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
        return `        if (dto.get${capitalizedName}() != null) {
            entity.set${capitalizedName}(dto.get${capitalizedName}());
        }`;
    }).join('\n');
    
    const entityFromDtoMappings = attributes.map((attr: any) => {
        const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
        return `        entity.set${capitalizedName}(dto.get${capitalizedName}());`;
    }).join('\n');
    
    const content = `package ${packageName};

import ${entityPackage}.${className};
import ${dtoPackage}.${className}DTO;
import ${repoPackage}.${className}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class ${className}Service {
    
    @Autowired
    private ${className}Repository ${className.toLowerCase()}Repository;
    
    public List<${className}DTO> findAll() {
        return ${className.toLowerCase()}Repository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Optional<${className}DTO> findById(Long id) {
        return ${className.toLowerCase()}Repository.findById(id)
            .map(this::convertToDTO);
    }
    
    public ${className}DTO save(${className}DTO ${className.toLowerCase()}DTO) {
        ${className} entity = convertToEntity(${className.toLowerCase()}DTO);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        ${className} savedEntity = ${className.toLowerCase()}Repository.save(entity);
        return convertToDTO(savedEntity);
    }
    
    public ${className}DTO update(Long id, ${className}DTO ${className.toLowerCase()}DTO) {
        Optional<${className}> existingEntity = ${className.toLowerCase()}Repository.findById(id);
        if (existingEntity.isPresent()) {
            ${className} entity = existingEntity.get();
            updateEntityFromDTO(entity, ${className.toLowerCase()}DTO);
            entity.setUpdatedAt(LocalDateTime.now());
            ${className} savedEntity = ${className.toLowerCase()}Repository.save(entity);
            return convertToDTO(savedEntity);
        }
        throw new RuntimeException("${className} not found with id: " + id);
    }
    
    public void deleteById(Long id) {
        ${className.toLowerCase()}Repository.deleteById(id);
    }
    
    // Métodos de conversión
    private ${className}DTO convertToDTO(${className} entity) {
        ${className}DTO dto = new ${className}DTO();
        dto.setId(entity.getId());
${dtoMappings}
        return dto;
    }
    
    private void updateEntityFromDTO(${className} entity, ${className}DTO dto) {
${entityMappings}
    }
    
    private ${className} convertToEntity(${className}DTO dto) {
        ${className} entity = new ${className}();
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
${entityFromDtoMappings}
        return entity;
    }
}`;

    return {
      path: `${className}Service.java`,
      content,
      language: 'other'
    };
  }
}

export default FixedCodeGenerator;
