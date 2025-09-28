/**
 * Download Service - Manejo de descarga de archivos ZIP REALES
 */

import JSZip from 'jszip';
import type { GeneratedFile, CodeGenerationResult } from '../types/codeGeneration';

export class DownloadService {
  
  /**
   * Crear archivo ZIP REAL con estructura de Maven correcta
   */
  static async createProjectZip(
    result: CodeGenerationResult, 
    projectName: string = 'springboot-project'
  ): Promise<Blob> {
    try {
      const zip = new JSZip();
      
      // Crear carpeta raíz del proyecto
      const projectFolder = zip.folder(projectName);
      if (!projectFolder) {
        throw new Error('No se pudo crear la carpeta del proyecto');
      }

      // Organizar archivos en la estructura Maven correcta
      result.files.forEach(file => {
        console.log(`Agregando archivo: ${file.path}`);
        
        // Determinar la ruta correcta según el tipo de archivo
        let correctPath = this.getCorrectMavenPath(file, projectName);
        
        // Agregar archivo al ZIP con la ruta correcta
        projectFolder.file(correctPath, file.content);
      });

      // Generar el ZIP real
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });

      console.log('ZIP generado exitosamente:', zipBlob.size, 'bytes');
      return zipBlob;

    } catch (error) {
      console.error('Error creando ZIP real:', error);
      throw error;
    }
  }

  /**
   * Obtener la ruta correcta según la estructura Maven estándar
   */
  private static getCorrectMavenPath(file: GeneratedFile, projectName: string): string {
    const cleanProjectName = projectName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const basePackage = `com.example.${cleanProjectName}`;
    const packagePath = basePackage.replace(/\./g, '/');

    console.log(`Procesando archivo: ${file.path}, tipo: ${file.language}`);

    // Archivos de configuración en la raíz
    if (file.path === 'pom.xml' || file.path === 'README.md') {
      return file.path;
    }

    // Resources
    if (file.path.includes('application.properties') || file.language === 'properties') {
      return 'src/main/resources/application.properties';
    }

    // Archivos Java - organizar por carpetas Maven
    if (file.language === 'other' && file.path.endsWith('.java')) {
      const fileName = file.path.split('/').pop() || file.path;
      
      // Determinar carpeta por nombre del archivo
      if (fileName.endsWith('Repository.java')) {
        return `src/main/java/${packagePath}/repository/${fileName}`;
      }
      if (fileName.endsWith('Service.java')) {
        return `src/main/java/${packagePath}/service/${fileName}`;
      }
      if (fileName.endsWith('Controller.java')) {
        return `src/main/java/${packagePath}/controller/${fileName}`;
      }
      if (fileName.endsWith('DTO.java')) {
        return `src/main/java/${packagePath}/dto/${fileName}`;
      }
      if (fileName.endsWith('Mapper.java')) {
        return `src/main/java/${packagePath}/mapper/${fileName}`;
      }
      if (fileName.includes('Config.java') || fileName.includes('Application.java')) {
        return `src/main/java/${packagePath}/config/${fileName}`;
      }
      
      // Por defecto, entities
      return `src/main/java/${packagePath}/entity/${fileName}`;
    }

    // Otros archivos
    return `src/main/resources/${file.path}`;
  }
  
  /**
   * Generar estructura visual del proyecto
   */
  private static generateProjectStructure(files: GeneratedFile[], projectName: string = 'springboot-project'): string {
    const structure: string[] = [];
    const folders = new Set<string>();
    
    // Extraer todas las carpetas
    files.forEach(file => {
      const parts = file.path.split('/');
      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
          const folder = parts.slice(0, i).join('/');
          if (folder) folders.add(folder);
        }
      }
    });
    
    // Ordenar carpetas
    const sortedFolders = Array.from(folders).sort();
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));
    
    structure.push(`${projectName}/`);
    
    // Agregar archivos organizados por estructura
    sortedFiles.forEach(file => {
      const depth = (file.path.match(/\//g) || []).length;
      const indent = '  '.repeat(depth);
      const fileName = file.path.split('/').pop();
      structure.push(`${indent}├── ${fileName}`);
    });
    
    return structure.join('\n');
  }
  
  /**
   * Generar instrucciones de configuración
   */
  private static generateSetupInstructions(projectName: string): string {
    return `
## SETUP INSTRUCTIONS:

### Prerequisites:
- Java 17 or higher
- Maven 3.6+ or Gradle 7+
- IDE: IntelliJ IDEA, Eclipse, or VS Code

### Quick Start:
1. Extract all files maintaining the folder structure
2. Import as Maven project in your IDE
3. Wait for Maven to download dependencies
4. Run the main application class or use: mvn spring-boot:run
5. Visit: http://localhost:8080
6. API documentation: http://localhost:8080/swagger-ui.html

### Project Structure:
- /src/main/java/${projectName.toLowerCase()}/entity/ - JPA Entities
- /src/main/java/${projectName.toLowerCase()}/dto/ - Data Transfer Objects  
- /src/main/java/${projectName.toLowerCase()}/repository/ - JPA Repositories
- /src/main/java/${projectName.toLowerCase()}/service/ - Business Logic
- /src/main/java/${projectName.toLowerCase()}/controller/ - REST Controllers
- /src/main/java/${projectName.toLowerCase()}/mapper/ - MapStruct Mappers
- /src/main/resources/ - Application configuration

### Database:
- H2 in-memory database (default)
- Console: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:testdb
- Username: sa (no password)

### API Endpoints:
All REST endpoints follow the pattern: /api/{entity-name}
- GET /api/{entity}/ - List all
- GET /api/{entity}/{id} - Get by ID  
- POST /api/{entity}/ - Create new
- PUT /api/{entity}/{id} - Update
- DELETE /api/{entity}/{id} - Delete

Generated with UML SpringBoot Code Generator
    `;
  }
  
  /**
   * Crear un archivo de texto como fallback (en caso de que JSZip no esté disponible)
   */
  static async createProjectText(
    result: CodeGenerationResult, 
    projectName: string = 'springboot-project'
  ): Promise<Blob> {
    let content = `# ${projectName} - SpringBoot Project\n\n`;
    content += `Generated SpringBoot project with ${result.files.length} files\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n\n`;
    content += '='.repeat(80) + '\n\n';
    
    content += '## PROJECT STRUCTURE:\n\n';
    // Mostrar estructura de archivos
    result.files.forEach(file => {
      content += `${file.path}\n`;
    });
    content += '\n' + '='.repeat(80) + '\n\n';
    
    // Agregar cada archivo con su contenido
    result.files.forEach(file => {
      content += `## File: ${file.path}\n`;
      content += `Language: ${file.language}\n\n`;
      content += '```' + file.language + '\n';
      content += file.content;
      content += '\n```\n\n';
      content += '-'.repeat(80) + '\n\n';
    });
    
    // Instrucciones de configuración
    content += '## SETUP INSTRUCTIONS:\n\n';
    content += '1. Extract the files maintaining the folder structure\n';
    content += '2. Open the project in your IDE (IntelliJ IDEA, Eclipse, VS Code)\n';
    content += '3. Wait for Maven to download dependencies\n';
    content += '4. Run: mvn spring-boot:run\n';
    content += '5. Visit: http://localhost:8080/swagger-ui.html\n';
    content += '6. API endpoints will be available under /api/\n\n';
    
    return new Blob([content], { type: 'text/plain' });
  }
  
  /**
   * Descargar archivo ZIP
   */
  static downloadZipFile(blob: Blob, fileName: string = 'springboot-project.zip'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
  
  /**
   * Descargar proyecto completo como ZIP REAL
   */
  static async downloadProject(
    result: CodeGenerationResult, 
    projectName: string = 'springboot-project'
  ): Promise<void> {
    try {
      console.log('Iniciando descarga de proyecto ZIP...');
      
      // Crear ZIP real con JSZip
      const zipBlob = await this.createProjectZip(result, projectName);
      const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
      
      // Descargar el archivo ZIP
      this.downloadFile(zipBlob, fileName);
      
      console.log(`✅ Proyecto ZIP descargado exitosamente: ${fileName}`);
      console.log(`📁 Tamaño: ${(zipBlob.size / 1024).toFixed(1)} KB`);
      
    } catch (error) {
      console.error('❌ Error al descargar proyecto:', error);
      throw new Error(`No se pudo descargar el proyecto: ${error}`);
    }
  }

  /**
   * Método mejorado para descargar archivos
   */
  private static downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Descargar archivo individual
   */
  static downloadSingleFile(file: GeneratedFile): void {
    const blob = new Blob([file.content], { 
      type: this.getMimeType(file.language) 
    });
    
    const fileName = file.path.split('/').pop() || 'file.txt';
    this.downloadZipFile(blob, fileName);
  }
  
  /**
   * Obtener tipo MIME basado en el lenguaje
   */
  private static getMimeType(language: string): string {
    const mimeTypes: Record<string, string> = {
      'java': 'text/x-java-source',
      'xml': 'application/xml',
      'properties': 'text/plain',
      'yml': 'text/yaml',
      'yaml': 'text/yaml',
      'md': 'text/markdown',
      'json': 'application/json',
      'other': 'text/plain'
    };
    
    return mimeTypes[language] || 'text/plain';
  }
  
  /**
   * Generar vista previa del contenido de un archivo
   */
  static generateFilePreview(file: GeneratedFile, maxLines: number = 50): string {
    const lines = file.content.split('\n');
    
    if (lines.length <= maxLines) {
      return file.content;
    }
    
    const previewLines = lines.slice(0, maxLines);
    const remainingLines = lines.length - maxLines;
    
    return previewLines.join('\n') + `\n\n... ${remainingLines} líneas más`;
  }
  
  /**
   * Obtener estadísticas del proyecto generado
   */
  static getProjectStats(result: CodeGenerationResult): {
    totalFiles: number;
    totalLines: number;
    filesByType: Record<string, number>;
    largestFile: { name: string; lines: number };
  } {
    const stats = {
      totalFiles: result.files.length,
      totalLines: 0,
      filesByType: {} as Record<string, number>,
      largestFile: { name: '', lines: 0 }
    };
    
    result.files.forEach(file => {
      const lines = file.content.split('\n').length;
      stats.totalLines += lines;
      
      // Contar archivos por tipo
      stats.filesByType[file.language] = (stats.filesByType[file.language] || 0) + 1;
      
      // Encontrar el archivo más grande
      if (lines > stats.largestFile.lines) {
        stats.largestFile = {
          name: file.path.split('/').pop() || file.path,
          lines
        };
      }
    });
    
    return stats;
  }
}

// Export default instance
export const downloadService = DownloadService;
