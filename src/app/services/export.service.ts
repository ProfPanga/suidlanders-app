import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { DatabaseService } from './database.service';
import { CompleteFormData } from '../interfaces/form-sections.interface';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private platform: Platform,
    private databaseService: DatabaseService
  ) {}

  async exportData(formData: CompleteFormData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `suidlanders-data-${timestamp}.html`;
    const htmlContent = await this.generateHTML(formData);

    if (this.platform.is('hybrid')) {
      // Mobile - use Capacitor Filesystem
      return this.exportToFile(htmlContent, fileName);
    } else {
      // Web - use Blob download
      return this.exportToBlob(htmlContent, fileName);
    }
  }

  private async exportToFile(
    htmlContent: string,
    fileName: string
  ): Promise<string> {
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: htmlContent,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return result.uri;
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }

  private exportToBlob(htmlContent: string, fileName: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async generateHTML(formData: CompleteFormData): Promise<string> {
    try {
      // Ensure we have valid data objects, even if empty
      const basicInfo = formData.basicInfo || {};
      const memberInfo = formData.memberInfo || {};
      const addressInfo = formData.addressInfo || {};
      const medicalInfo = formData.medicalInfo || {};
      const vehicleInfo = formData.vehicleInfo || {};
      const skillsInfo = formData.skillsInfo || {};
      const equipmentInfo = formData.equipmentInfo || {};

      // Generate HTML sections
      const basicInfoHTML = this.generateBasicInfoHTML(basicInfo);
      const memberInfoHTML = this.generateMemberInfoHTML(memberInfo);
      const addressInfoHTML = this.generateAddressInfoHTML(addressInfo);
      const medicalInfoHTML = this.generateMedicalInfoHTML(medicalInfo);
      const vehicleInfoHTML = this.generateVehicleInfoHTML(vehicleInfo);
      const skillsInfoHTML = this.generateSkillsInfoHTML(skillsInfo);
      const equipmentInfoHTML = this.generateEquipmentInfoHTML(equipmentInfo);

      // Combine all sections into final HTML
      const html = `
        <!DOCTYPE html>
        <html lang="af">
        <head>
          <meta charset="UTF-8">
          <title>Suidlanders Lid Inligting</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              line-height: 1.6;
            }
            .section { 
              margin-bottom: 30px;
              border: 1px solid #ccc;
              padding: 20px;
              border-radius: 5px;
            }
            .section h2 { 
              color: #333;
              margin-top: 0;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .field {
              margin-bottom: 10px;
            }
            .field-label {
              font-weight: bold;
              color: #666;
            }
            @media print {
              body {
                font-size: 12pt;
              }
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <h1>Suidlanders Lid Inligting</h1>
          ${basicInfoHTML}
          ${memberInfoHTML}
          ${addressInfoHTML}
          ${medicalInfoHTML}
          ${vehicleInfoHTML}
          ${skillsInfoHTML}
          ${equipmentInfoHTML}
          <footer style="text-align: center; margin-top: 40px; color: #666;">
            Gegenereer op ${new Date().toLocaleString('af-ZA')}
          </footer>
        </body>
        </html>
      `;

      return html;
    } catch (error) {
      console.error('Error generating HTML:', error);
      throw error;
    }
  }

  private generateBasicInfoHTML(data: any): string {
    return `
      <div class="section">
        <h2>Basiese Inligting</h2>
        <div class="field">
          <div class="field-label">Van:</div>
          ${data.van || ''}
        </div>
        <div class="field">
          <div class="field-label">Noemnaam:</div>
          ${data.noemNaam || ''}
        </div>
        <div class="field">
          <div class="field-label">Tweede Naam:</div>
          ${data.tweedeNaam || ''}
        </div>
        <div class="field">
          <div class="field-label">Huistaal:</div>
          ${data.huistaal || ''}
        </div>
        <div class="field">
          <div class="field-label">Geslag:</div>
          ${data.geslag || ''}
        </div>
        <div class="field">
          <div class="field-label">Ouderdom:</div>
          ${data.ouderdom || ''}
        </div>
        <div class="field">
          <div class="field-label">Geboortedatum:</div>
          ${data.geboorteDatum || ''}
        </div>
        <div class="field">
          <div class="field-label">ID Nommer:</div>
          ${data.idNommer || ''}
        </div>
        <div class="field">
          <div class="field-label">Selfoon Nommer:</div>
          ${data.cellNommer || ''}
        </div>
        <div class="field">
          <div class="field-label">E-pos:</div>
          ${data.email || ''}
        </div>
        <div class="field">
          <div class="field-label">Huwelikstatus:</div>
          ${data.huwelikStatus || ''}
        </div>
      </div>
    `;
  }

  private generateMemberInfoHTML(data: any): string {
    return `
      <div class="section">
        <h2>Lid Inligting</h2>
        <div class="field">
          <div class="field-label">Lid Nommer:</div>
          ${data.lidNommer || ''}
        </div>
        <div class="field">
          <div class="field-label">Reddings Verwysing:</div>
          ${data.reddingsVerwysing || ''}
        </div>
        <div class="field">
          <div class="field-label">Bevelstruktuur:</div>
          ${data.bevelstruktuur || ''}
        </div>
        <div class="field">
          <div class="field-label">Radio Roepsein:</div>
          ${data.radioRoepsein || ''}
        </div>
        <div class="field">
          <div class="field-label">Nood Kontak Naam:</div>
          ${data.noodKontakNaam || ''}
        </div>
        <div class="field">
          <div class="field-label">Nood Kontak Nommer:</div>
          ${data.noodKontakNommer || ''}
        </div>
        <div class="field">
          <div class="field-label">Nood Kontak Verwantskap:</div>
          ${data.noodKontakVerwantskap || ''}
        </div>
      </div>
    `;
  }

  private generateMedicalInfoHTML(data: any): string {
    return `
      <div class="section">
        <h2>Mediese Inligting</h2>
        <div class="field">
          <div class="field-label">Bloedgroep:</div>
          ${data.bloedGroep || ''}
        </div>
        <div class="field">
          <div class="field-label">Chroniese Siektes:</div>
          ${data.chroniesesiektes || 'Geen'}
        </div>
        <div class="field">
          <div class="field-label">Medikasie:</div>
          ${data.medikasie || 'Geen'}
        </div>
        <div class="field">
          <div class="field-label">Allergieë:</div>
          ${data.allergies || 'Geen'}
        </div>
        <div class="field">
          <div class="field-label">Mediese Fonds:</div>
          ${data.medieseFonds || 'N/A'} - ${data.medieseFondsNommer || 'N/A'}
        </div>
      </div>
    `;
  }

  private generateAddressInfoHTML(data: any): string {
    return `
      <div class="section">
        <h2>Adres Inligting</h2>
        <div class="field">
          <div class="field-label">Straat Adres:</div>
          ${data.straatAdres || ''}
        </div>
        <div class="field">
          <div class="field-label">Voorstad:</div>
          ${data.voorstad || ''}
        </div>
        
        <div class="field">
          <div class="field-label">Provinsie:</div>
          ${data.provinsie || ''}
        </div>
        <div class="field">
          <div class="field-label">Poskode:</div>
          ${data.posKode || ''}
        </div>
      </div>
    `;
  }

  private generateVehicleInfoHTML(data: any): string {
    const primary = data.primereVoertuig || {};
    return `
      <div class="section">
        <h2>Voertuig Inligting</h2>
        <div class="field">
          <div class="field-label">Primêre Voertuig:</div>
          ${primary.fabrikaat || ''} ${primary.model || ''} (${
      primary.jaar || ''
    })<br>
          Reg: ${primary.registrasieNommer || ''}<br>
          Brandstof: ${primary.brandstofTipe || ''}<br>
          KM Stand: ${primary.kilometerStand || ''}
        </div>
        ${
          data.sleepwa
            ? `
          <div class="field">
            <div class="field-label">Sleepwa:</div>
            Kapasiteit: ${data.sleepwaKapasiteit || ''}kg
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  private generateSkillsInfoHTML(data: any): string {
    return `
      <div class="section">
        <h2>Vaardighede & Ervaring</h2>
        <div class="field">
          <div class="field-label">Beroep:</div>
          ${data.beroep || ''}
        </div>
        <div class="field">
          <div class="field-label">Bestuurslisensie:</div>
          Kode ${data.bestuurslisensie?.kode || ''} 
          ${data.bestuurslisensie?.pdp ? '(PDP)' : ''}
        </div>
        ${
          data.noodhulp?.vlak
            ? `
          <div class="field">
            <div class="field-label">Noodhulp:</div>
            ${data.noodhulp.vlak} (Verval: ${
                data.noodhulp.vervalDatum || 'N/A'
              })
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  private generateEquipmentInfoHTML(data: any): string {
    return `
      <div class="section">
        <h2>Toerusting & Hulpbronne</h2>
        <div class="field">
          <div class="field-label">Kommunikasie:</div>
          ${data.kommunikasie?.radio ? 'Radio, ' : ''}
          ${data.kommunikasie?.satellietFoon ? 'Satelliet Foon, ' : ''}
          ${data.kommunikasie?.tweerigtingRadio ? 'Tweerigtingradio' : ''}
        </div>
        <div class="field">
          <div class="field-label">Kragopwekking:</div>
          ${data.kragOpwekking?.kragOpwekker ? 'Kragopwekker, ' : ''}
          ${data.kragOpwekking?.sonkragStelsel ? 'Sonkragstelsel, ' : ''}
          ${data.kragOpwekking?.omvormer ? 'Omvormer' : ''}
        </div>
        <div class="field">
          <div class="field-label">Waterbronne:</div>
          ${data.waterBronne?.boorgat ? 'Boorgat, ' : ''}
          ${data.waterBronne?.waterTenk ? 'Watertenk' : ''}
        </div>
      </div>
    `;
  }
}
