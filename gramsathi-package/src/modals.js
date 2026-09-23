// GramSathi Modals Library
window.GramModals = (function() {
  const container = () => document.getElementById('modal-container');

  function closeModal() {
    const c = container();
    if (c) {
      c.innerHTML = '';
      c.classList.remove('active');
    }
  }

  // 1. Comprehensive Animal Profile Modal with Tabs & Timeline
  function showAnimalProfileModal(id, activeTab = 'overview') {
    const state = GramStore.getState();
    const animal = state.iot.livestock.find(a => a.id === id);
    if (!animal) return;

    // Get animal milk records
    const animalMilk = (state.dairy.records || []).filter(r => r.animalId === id);
    const totalMilk = animalMilk.reduce((sum, r) => sum + (parseFloat(r.liters) || 0), 0);

    const c = container();
    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content" style="max-width:640px;">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="badge badge-neutral" style="font-size:0.8rem; font-weight:700;">${animal.id}</span>
              <h3 style="font-size:1.15rem; font-weight:800;">${animal.name} (${animal.type})</h3>
              <span class="badge ${animal.temperature > 39.5 ? 'badge-danger' : 'badge-success'}">${animal.breed}</span>
            </div>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>

          <!-- Tab buttons -->
          <div class="tabs-header">
            <button class="tab-btn ${activeTab === 'overview' ? 'active' : ''}" onclick="GramModals.showAnimalProfileModal('${animal.id}', 'overview')">Overview</button>
            <button class="tab-btn ${activeTab === 'health' ? 'active' : ''}" onclick="GramModals.showAnimalProfileModal('${animal.id}', 'health')">Health & Collars</button>
            <button class="tab-btn ${activeTab === 'milk' ? 'active' : ''}" onclick="GramModals.showAnimalProfileModal('${animal.id}', 'milk')">Milk History (${animalMilk.length})</button>
            <button class="tab-btn ${activeTab === 'feed' ? 'active' : ''}" onclick="GramModals.showAnimalProfileModal('${animal.id}', 'feed')">Feed Ration</button>
            <button class="tab-btn ${activeTab === 'timeline' ? 'active' : ''}" onclick="GramModals.showAnimalProfileModal('${animal.id}', 'timeline')">Timeline</button>
          </div>

          <!-- Tab Contents -->
          <div style="min-height:220px; font-size:0.83rem;">
            
            ${activeTab === 'overview' ? `
              <div style="display:flex; flex-direction:column; gap:0.65rem;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">AGE</span>
                    <div style="font-size:1rem; font-weight:700;">${animal.age} Years</div>
                  </div>
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">LACTATION STAGE</span>
                    <div style="font-size:1rem; font-weight:700;">${animal.lactationStage}</div>
                  </div>
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">DAILY MILK AVG</span>
                    <div style="font-size:1rem; font-weight:700; color:var(--primary);">${animal.dailyMilkAvg} Liters / day</div>
                  </div>
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">GEOFENCE LOCATION</span>
                    <div style="font-size:0.9rem; font-weight:700; color:var(--success);">${animal.geofenceStatus}</div>
                  </div>
                </div>
                <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                  <strong>Veterinary Note:</strong> ${animal.healthNotes}
                </div>
              </div>
            ` : ''}

            ${activeTab === 'health' ? `
              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.6rem;">
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">BODY TEMP</span>
                    <div style="font-size:1.2rem; font-weight:800; color:${animal.temperature > 39.5 ? 'var(--danger)' : 'inherit'};">${animal.temperature}°C</div>
                    <span style="font-size:0.68rem; color:${animal.temperature > 39.5 ? 'var(--danger)' : 'var(--success)'};">${animal.temperature > 39.5 ? 'High Temperature' : 'Normal'}</span>
                  </div>
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">HEART RATE</span>
                    <div style="font-size:1.2rem; font-weight:800;">${animal.heartRate} bpm</div>
                    <span style="font-size:0.68rem; color:var(--success);">Nominal Range</span>
                  </div>
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">RUMINATION</span>
                    <div style="font-size:1.2rem; font-weight:800; color:var(--success);">${animal.ruminationMinutes} min</div>
                    <span style="font-size:0.68rem; color:var(--text-muted);">Daily Target: >400m</span>
                  </div>
                </div>
                <div style="padding:0.6rem; border-radius:var(--radius-md); background:var(--warning-subtle); color:var(--warning); font-size:0.75rem;">
                  <strong>* Threshold Notice:</strong> Telemetry collar readings are simulated demonstration indicators — not a medical diagnosis.
                </div>
              </div>
            ` : ''}

            ${activeTab === 'milk' ? `
              <div style="display:flex; flex-direction:column; gap:0.65rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span>Recorded Collection: <strong>${totalMilk.toFixed(1)} Liters</strong></span>
                  <button class="btn btn-primary btn-sm" onclick="GramModals.showRecordMilkModal();">
                    + Log Milk Entry
                  </button>
                </div>
                <div class="table-container" style="max-height:160px;">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Session</th>
                        <th>Yield (L)</th>
                        <th>Fat %</th>
                        <th>SNF %</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${animalMilk.length === 0 ? `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No milk records for this animal tag.</td></tr>` : 
                        animalMilk.map(m => `
                          <tr>
                            <td>${m.date}</td>
                            <td><span class="badge ${m.session === 'Morning' ? 'badge-warning' : 'badge-info'}">${m.session}</span></td>
                            <td><strong>${m.liters} L</strong></td>
                            <td>${m.fat}%</td>
                            <td>${m.snf}%</td>
                          </tr>
                        `).join('')
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            ${activeTab === 'feed' ? `
              <div style="display:flex; flex-direction:column; gap:0.65rem;">
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.6rem;">
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">GREEN FODDER</span>
                    <div style="font-size:1.15rem; font-weight:800; color:var(--primary);">${animal.feedRation.green} kg</div>
                  </div>
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">DRY FODDER</span>
                    <div style="font-size:1.15rem; font-weight:800;">${animal.feedRation.dry} kg</div>
                  </div>
                  <div style="background:var(--bg-main); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border);">
                    <span style="color:var(--text-muted); font-size:0.72rem;">CONCENTRATE</span>
                    <div style="font-size:1.15rem; font-weight:800; color:var(--accent);">${animal.feedRation.concentrate} kg</div>
                  </div>
                </div>
                <p style="font-size:0.78rem; color:var(--text-muted);">
                  Standard dairy nutrition ration calculated according to ICAR animal nutrition guidelines for ${animal.breed} cattle in ${animal.lactationStage}.
                </p>
              </div>
            ` : ''}

            ${activeTab === 'timeline' ? `
              <div class="timeline" style="max-height:200px; overflow-y:auto; padding-right:0.5rem;">
                ${(animal.timeline || []).map(item => `
                  <div class="timeline-item">
                    <div class="timeline-time">${item.time}</div>
                    <div>${item.event}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="GramModals.closeModal();">Close</button>
            <button type="button" class="btn btn-primary" onclick="GramModals.showEditAnimalModal('${animal.id}');">Edit Cattle Details</button>
          </div>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  // 2. Record Milk Modal
  function showRecordMilkModal() {
    const c = container();
    const state = GramStore.getState();
    const animals = state.iot.livestock || [];

    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Record Milk Collection Entry</h3>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>
          <form id="record-milk-form" onsubmit="event.preventDefault(); GramModals.handleRecordMilkSubmit();">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" class="form-control" id="milk-date" value="${new Date().toISOString().split('T')[0]}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Collection Session</label>
              <select class="form-control" id="milk-session">
                <option value="Morning">Morning (06:00 AM - 08:30 AM)</option>
                <option value="Evening">Evening (05:00 PM - 07:30 PM)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Animal ID / Cattle</label>
              <select class="form-control" id="milk-animal">
                ${animals.map(a => `<option value="${a.id}">${a.id} - ${a.name} (${a.breed})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Milk Quantity (Liters)</label>
              <input type="number" step="0.1" min="0.5" max="50" class="form-control" id="milk-liters" placeholder="e.g. 7.5" required />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem;">
              <div class="form-group">
                <label class="form-label">Fat %</label>
                <input type="number" step="0.1" min="2" max="12" class="form-control" id="milk-fat" value="4.5" required />
              </div>
              <div class="form-group">
                <label class="form-label">SNF %</label>
                <input type="number" step="0.1" min="6" max="12" class="form-control" id="milk-snf" value="8.5" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Farmer / Producer Name</label>
              <input type="text" class="form-control" id="milk-farmer" value="Ramesh Patel" required />
            </div>
            <div class="form-group">
              <label class="form-label">Notes / Remarks</label>
              <input type="text" class="form-control" id="milk-note" placeholder="Optional quality notes" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="GramModals.closeModal();">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Entry</button>
            </div>
          </form>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  function handleRecordMilkSubmit() {
    const record = {
      date: document.getElementById('milk-date').value,
      session: document.getElementById('milk-session').value,
      animalId: document.getElementById('milk-animal').value,
      liters: parseFloat(document.getElementById('milk-liters').value) || 0,
      fat: parseFloat(document.getElementById('milk-fat').value) || 4.5,
      snf: parseFloat(document.getElementById('milk-snf').value) || 8.5,
      farmer: document.getElementById('milk-farmer').value,
      note: document.getElementById('milk-note').value
    };
    GramStore.addMilkRecord(record);
    closeModal();
    GramApp.showToast('Milk collection record saved and ledger updated!');
    if (window.location.hash === '#dairy') {
      GramViews.renderDairy(document.getElementById('page-content'));
    } else {
      GramViews.renderDashboard(document.getElementById('page-content'));
    }
  }

  // 3. Add Animal Modal
  function showAddAnimalModal() {
    const c = container();
    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Register New Livestock Tag</h3>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>
          <form id="add-animal-form" onsubmit="event.preventDefault(); GramModals.handleAddAnimalSubmit();">
            <div class="form-group">
              <label class="form-label">Cattle Name</label>
              <input type="text" class="form-control" id="anim-name" placeholder="e.g. Nandini" required />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem;">
              <div class="form-group">
                <label class="form-label">Species / Type</label>
                <select class="form-control" id="anim-type">
                  <option value="Cow">Cow</option>
                  <option value="Buffalo">Buffalo</option>
                  <option value="Goat">Goat</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Breed</label>
                <input type="text" class="form-control" id="anim-breed" value="Gir (Indigenous Dairy)" required />
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem;">
              <div class="form-group">
                <label class="form-label">Age (Years)</label>
                <input type="number" min="1" max="20" class="form-control" id="anim-age" value="3" required />
              </div>
              <div class="form-group">
                <label class="form-label">Lactation Stage</label>
                <select class="form-control" id="anim-lactation">
                  <option value="Peak (Month 2-4)">Peak (Month 2-4)</option>
                  <option value="Mid (Month 5-7)">Mid (Month 5-7)</option>
                  <option value="Late (Month 8-10)">Late (Month 8-10)</option>
                  <option value="Dry Period">Dry Period</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Daily Avg Milk Yield (Liters)</label>
              <input type="number" step="0.5" class="form-control" id="anim-milk" value="12.0" required />
            </div>
            <div class="form-group">
              <label class="form-label">Veterinary & Health Notes</label>
              <input type="text" class="form-control" id="anim-notes" value="Healthy, RFID ear tag synced." />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="GramModals.closeModal();">Cancel</button>
              <button type="submit" class="btn btn-primary">Register Animal</button>
            </div>
          </form>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  function handleAddAnimalSubmit() {
    const animalData = {
      name: document.getElementById('anim-name').value,
      type: document.getElementById('anim-type').value,
      breed: document.getElementById('anim-breed').value,
      age: parseInt(document.getElementById('anim-age').value, 10) || 3,
      lactationStage: document.getElementById('anim-lactation').value,
      dailyMilkAvg: parseFloat(document.getElementById('anim-milk').value) || 10.0,
      healthNotes: document.getElementById('anim-notes').value
    };
    GramStore.addAnimal(animalData);
    closeModal();
    GramApp.showToast('New cattle RFID profile registered successfully!');
    if (window.location.hash === '#livestock') {
      GramViews.renderLivestock(document.getElementById('page-content'));
    }
  }

  // 4. Edit Animal Modal
  function showEditAnimalModal(id) {
    const state = GramStore.getState();
    const animal = state.iot.livestock.find(a => a.id === id);
    if (!animal) return;

    const c = container();
    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Edit Cattle Profile (${animal.id})</h3>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>
          <form onsubmit="event.preventDefault(); GramModals.handleEditAnimalSubmit('${animal.id}');">
            <div class="form-group">
              <label class="form-label">Cattle Name</label>
              <input type="text" class="form-control" id="edit-anim-name" value="${animal.name}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Lactation Stage</label>
              <input type="text" class="form-control" id="edit-anim-lactation" value="${animal.lactationStage}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Daily Avg Milk (L)</label>
              <input type="number" step="0.5" class="form-control" id="edit-anim-milk" value="${animal.dailyMilkAvg}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Veterinary & Health Notes</label>
              <textarea class="form-control" id="edit-anim-notes" rows="2">${animal.healthNotes}</textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="GramModals.closeModal();">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  function handleEditAnimalSubmit(id) {
    const updated = {
      name: document.getElementById('edit-anim-name').value,
      lactationStage: document.getElementById('edit-anim-lactation').value,
      dailyMilkAvg: parseFloat(document.getElementById('edit-anim-milk').value) || 10.0,
      healthNotes: document.getElementById('edit-anim-notes').value
    };
    GramStore.updateAnimal(id, updated);
    closeModal();
    GramApp.showToast('Animal profile updated successfully');
    if (window.location.hash === '#livestock') {
      GramViews.renderLivestock(document.getElementById('page-content'));
    }
  }

  // 5. SMS Cellular Dispatch Simulation Modal
  function showSmsModal() {
    const c = container();
    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Broadcast Cellular SMS Alert</h3>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>
          <form onsubmit="event.preventDefault(); GramModals.handleSmsSubmit();">
            <div class="form-group">
              <label class="form-label">Recipient Mobile Number</label>
              <input type="tel" class="form-control" id="sms-recipient" value="+91 98765 43210" required />
            </div>
            <div class="form-group">
              <label class="form-label">Alert Message Content</label>
              <textarea class="form-control" id="sms-msg" rows="3" required>GramSathi Alert: Water tank level at 74%. Solar microgrid power stable at 4.8 kW.</textarea>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.75rem;">
              * Note: Demonstrates simulated cellular SMS dispatch to registered Panchayat members & farmers.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="GramModals.closeModal();">Cancel</button>
              <button type="submit" class="btn btn-primary">Dispatch SMS</button>
            </div>
          </form>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  function handleSmsSubmit() {
    const rec = document.getElementById('sms-recipient').value;
    const msg = document.getElementById('sms-msg').value;
    GramStore.sendSmsAlert(rec, msg);
    closeModal();
    GramApp.showToast('SMS dispatched via simulated GSM gateway!');
    if (window.location.hash === '#alerts') {
      GramViews.renderAlerts(document.getElementById('page-content'));
    }
  }

  // 6. Scheme Eligibility Wizard Modal
  function showEligibilityModal() {
    const c = container();
    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content" style="max-width:600px;">
          <div class="modal-header">
            <h3>Government Scheme Eligibility Wizard</h3>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>
          <div id="wizard-step-container">
            <form onsubmit="event.preventDefault(); GramModals.evaluateWizard();">
              <div class="form-group">
                <label class="form-label">1. Landholding Category</label>
                <select class="form-control" id="wiz-land">
                  <option value="yes_small">Small / Marginal Farmer (< 2 Hectares / 5 Acres)</option>
                  <option value="yes_large">Medium / Large Farmer (> 5 Acres)</option>
                  <option value="tenant">Tenant / Landless Agricultural Worker</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">2. Do you rear cattle or dairy livestock?</label>
                <select class="form-control" id="wiz-livestock">
                  <option value="yes">Yes (Dairy cattle, buffaloes, or goats)</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">3. Kisan Credit Card (KCC) Status</label>
                <select class="form-control" id="wiz-kcc">
                  <option value="no">No (Interested in subsidized 4% farm credit)</option>
                  <option value="yes">Yes (Already have KCC limit)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">4. Solar Pump or Micro-Irrigation Subsidy</label>
                <select class="form-control" id="wiz-irrigation">
                  <option value="yes">Yes (Seeking PM-KUSUM or PMKSY drip subsidy)</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="GramModals.closeModal();">Cancel</button>
                <button type="submit" class="btn btn-primary">Find Relevant Schemes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  function evaluateWizard() {
    const land = document.getElementById('wiz-land').value;
    const livestock = document.getElementById('wiz-livestock').value;
    const kcc = document.getElementById('wiz-kcc').value;
    const irrigation = document.getElementById('wiz-irrigation').value;

    const state = GramStore.getState();
    const allSchemes = state.schemes || [];

    const matched = allSchemes.filter(s => {
      if (s.name.includes('PM-Kisan') && land.startsWith('yes')) return true;
      if (s.name.includes('KCC') && kcc === 'no') return true;
      if (s.name.includes('Gokul') && livestock === 'yes') return true;
      if (s.name.includes('AHIDF') && livestock === 'yes') return true;
      if (s.name.includes('PMKSY') && irrigation === 'yes') return true;
      if (s.name.includes('Soil Health')) return true;
      if (s.name.includes('PMFBY') && land.startsWith('yes')) return true;
      return false;
    });

    const stepContainer = document.getElementById('wizard-step-container');
    stepContainer.innerHTML = `
      <div>
        <div style="margin-bottom:0.75rem;">
          <h4 style="font-size:1rem; font-weight:800; color:var(--primary);">
            Potentially Relevant Based on Information Provided (${matched.length} Matched)
          </h4>
          <p style="font-size:0.75rem; color:var(--text-muted);">
            * Disclaimer: Scheme eligibility is subject to official verification by the nodal department.
          </p>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.6rem; max-height:360px; overflow-y:auto; padding-right:0.4rem;">
          ${matched.map(s => `
            <div style="padding:0.65rem 0.85rem; border-radius:var(--radius-md); background:var(--bg-main); border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
                <div>
                  <strong style="font-size:0.9rem;">${s.name}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${s.benefits}</div>
                </div>
                <a href="${s.link || s.officialPortal || 'https://www.myscheme.gov.in/'}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex-shrink:0;">
                  Apply
                </a>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" onclick="GramModals.closeModal();">Done</button>
        </div>
      </div>
    `;
  }

  // 8. Dynamic Village Status Comprehensive Modal
  function showVillageStatusModal() {
    const summary = GramStore.getVillageStatusSummary();
    const c = container();
    if (!c) return;

    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content" style="max-width:720px;">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
              <h3 style="font-size:1.25rem; font-weight:900;">Village Operating Health & Status</h3>
              <span class="badge badge-${summary.overallBadge}" style="font-size:0.8rem; font-weight:800;">
                ${summary.overallStatus}
              </span>
            </div>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>

          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">
            Real-time multi-subsystem telemetry synthesis dynamically generated from live village IoT state.
          </p>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.75rem; max-height:60vh; overflow-y:auto; padding-right:0.25rem;">
            
            <!-- Energy Subsystem -->
            <div class="card" style="padding:0.85rem; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <div style="font-weight:800; display:flex; align-items:center; gap:0.4rem;">
                  <span>☀️</span> <span>Solar Microgrid</span>
                </div>
                <span class="badge badge-${summary.energy.badge}">${summary.energy.status}</span>
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.4;">
                <div>Generation: <strong style="color:var(--text-main);">${summary.energy.solarGen} kW</strong> | Battery: <strong style="color:var(--text-main);">${summary.energy.batterySoc}%</strong></div>
                <div>Village Load: <strong style="color:var(--text-main);">${summary.energy.load} kW</strong> (${summary.energy.scenario})</div>
              </div>
              <div style="margin-top:0.6rem; display:flex; gap:0.4rem;">
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramModals.closeModal(); window.location.hash = '#energy';">Open Energy</button>
              </div>
            </div>

            <!-- Water Subsystem -->
            <div class="card" style="padding:0.85rem; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <div style="font-weight:800; display:flex; align-items:center; gap:0.4rem;">
                  <span>💧</span> <span>Potable Water Tank</span>
                </div>
                <span class="badge badge-${summary.water.badge}">${summary.water.status}</span>
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.4;">
                <div>Tank Level: <strong style="color:var(--text-main);">${summary.water.tankLevel}%</strong> | Pump: <strong style="color:var(--text-main);">${summary.water.pumpStatus}</strong></div>
                <div>Potability: <strong style="color:var(--text-main);">pH ${summary.water.ph}</strong>, Turbidity: <strong style="color:var(--text-main);">${summary.water.turbidity} NTU</strong></div>
              </div>
              <div style="margin-top:0.6rem; display:flex; gap:0.4rem;">
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramModals.closeModal(); window.location.hash = '#water';">Open Water</button>
              </div>
            </div>

            <!-- Livestock Subsystem -->
            <div class="card" style="padding:0.85rem; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <div style="font-weight:800; display:flex; align-items:center; gap:0.4rem;">
                  <span>🐄</span> <span>Livestock Telemetry</span>
                </div>
                <span class="badge badge-${summary.livestock.badge}">${summary.livestock.status}</span>
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.4;">
                <div>Monitored Heads: <strong style="color:var(--text-main);">${summary.livestock.totalCount}</strong> | Safe Pasture</div>
                <div>Health Alert: <strong style="color:${summary.livestock.feverCount > 0 ? 'var(--danger)' : 'var(--success)'};">${summary.livestock.feverCount > 0 ? summary.livestock.feverishNames.join(', ') + ' High Temp' : 'All vitals normal'}</strong></div>
              </div>
              <div style="margin-top:0.6rem; display:flex; gap:0.4rem;">
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramModals.closeModal(); window.location.hash = '#livestock';">Open Livestock</button>
              </div>
            </div>

            <!-- Weather Subsystem -->
            <div class="card" style="padding:0.85rem; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <div style="font-weight:800; display:flex; align-items:center; gap:0.4rem;">
                  <span>🌦</span> <span>Village Micro-Climate</span>
                </div>
                <span class="badge badge-live">LIVE WEATHER</span>
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.4;">
                <div>Temperature: <strong style="color:var(--text-main);">${summary.weather.temperature}°C</strong> (${summary.weather.condition})</div>
                <div>Humidity: <strong style="color:var(--text-main);">${summary.weather.humidity}%</strong> | Rain Prob: <strong style="color:var(--text-main);">${summary.weather.rainChance}%</strong></div>
              </div>
              <div style="margin-top:0.6rem; display:flex; gap:0.4rem;">
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramModals.closeModal(); window.location.hash = '#weather';">Open Weather</button>
              </div>
            </div>

            <!-- Agriculture Advisory -->
            <div class="card" style="padding:0.85rem; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <div style="font-weight:800; display:flex; align-items:center; gap:0.4rem;">
                  <span>🌾</span> <span>Agronomic Advisory</span>
                </div>
                <span class="badge badge-success">ADVISORY</span>
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.4;">
                <div>Season: <strong style="color:var(--text-main);">${summary.agriculture.currentSeason}</strong></div>
                <div style="margin-top:0.2rem; font-size:0.78rem;">${summary.agriculture.advisory}</div>
              </div>
              <div style="margin-top:0.6rem; display:flex; gap:0.4rem;">
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramModals.closeModal(); window.location.hash = '#agriculture';">Crop Advisor</button>
              </div>
            </div>

            <!-- Active Alerts Summary -->
            <div class="card" style="padding:0.85rem; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <div style="font-weight:800; display:flex; align-items:center; gap:0.4rem;">
                  <span>🚨</span> <span>System Incident Alerts</span>
                </div>
                <span class="badge badge-${summary.alerts.criticalCount > 0 ? 'danger' : (summary.alerts.warningCount > 0 ? 'warning' : 'neutral')}">
                  ${summary.alerts.totalActive} Active
                </span>
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.4;">
                <div>Critical: <strong style="color:var(--danger);">${summary.alerts.criticalCount}</strong> | Warning: <strong style="color:var(--warning);">${summary.alerts.warningCount}</strong> | Info: <strong style="color:var(--info);">${summary.alerts.infoCount}</strong></div>
                ${summary.alerts.latest.length > 0 ? `
                  <div style="font-size:0.75rem; margin-top:0.3rem; color:var(--text-main); font-weight:600;">
                    Latest: ${summary.alerts.latest[0].message}
                  </div>
                ` : '<div style="font-size:0.75rem; margin-top:0.3rem;">No pending incident alerts.</div>'}
              </div>
              <div style="margin-top:0.6rem; display:flex; gap:0.4rem;">
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="GramModals.closeModal(); window.location.hash = '#alerts';">Open Alerts</button>
              </div>
            </div>

          </div>

          <div class="modal-footer" style="margin-top:1rem;">
            <button type="button" class="btn btn-outline" onclick="GramModals.closeModal();">Close</button>
            <button type="button" class="btn btn-primary" onclick="GramModals.closeModal(); GramApp.navigate('#cosmos');">Back to COSMOS Display</button>
          </div>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  // 9. Alert Action Drill-down Modal
  function showAlertActionModal(alertId) {
    const state = GramStore.getState();
    const alertItem = (state.alerts || []).find(a => a.id === alertId);
    if (!alertItem) return;

    const c = container();
    if (!c) return;

    let targetRoute = 'dashboard';
    let targetLabel = 'Open Dashboard';
    const cat = (alertItem.category || '').toLowerCase();
    if (cat.includes('energy') || cat.includes('solar') || cat.includes('battery')) {
      targetRoute = 'energy';
      targetLabel = 'Open Solar Energy';
    } else if (cat.includes('water') || cat.includes('tank') || cat.includes('pump')) {
      targetRoute = 'water';
      targetLabel = 'Open Water System';
    } else if (cat.includes('livestock') || cat.includes('cattle') || cat.includes('animal')) {
      targetRoute = 'livestock';
      targetLabel = 'Open Livestock Hub';
    } else if (cat.includes('weather')) {
      targetRoute = 'weather';
      targetLabel = 'Open Weather';
    }

    c.innerHTML = `
      <div class="modal-backdrop active" onclick="if(event.target === this) GramModals.closeModal();">
        <div class="modal-content" style="max-width:540px;">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="badge badge-${alertItem.type === 'danger' ? 'danger' : (alertItem.type === 'warning' ? 'warning' : 'info')}">
                ${(alertItem.type || 'INFO').toUpperCase()}
              </span>
              <h3 style="font-size:1.15rem; font-weight:800;">${alertItem.category} Incident</h3>
            </div>
            <button class="modal-close-btn" onclick="GramModals.closeModal();">&times;</button>
          </div>

          <div style="background:var(--bg-main); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border); margin:0.75rem 0;">
            <div style="font-size:0.95rem; font-weight:700; margin-bottom:0.4rem; color:var(--text-main);">
              ${alertItem.message}
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); display:flex; justify-content:space-between;">
              <span>Source: ${alertItem.source || 'IoT Subsystem Telemetry'}</span>
              <span>${new Date(alertItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.4; margin-bottom:1rem;">
            <strong>Recommended Mitigation:</strong> Open the ${alertItem.category} subsystem to verify sensor parameters, trigger corrective actions, or dispatch an SMS advisory to village operators.
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="
              GramStore.resolveAlert('${alertItem.id}');
              GramModals.closeModal();
              GramApp.showToast('Alert marked as resolved');
              GramApp.navigate(window.location.hash || '#cosmos');
            ">Mark Resolved</button>
            <button type="button" class="btn btn-primary" onclick="
              GramModals.closeModal();
              window.location.hash = '#${targetRoute}';
            ">${targetLabel}</button>
          </div>
        </div>
      </div>
    `;
    c.classList.add('active');
  }

  return {
    closeModal,
    showAnimalProfileModal,
    showRecordMilkModal,
    handleRecordMilkSubmit,
    showAddAnimalModal,
    handleAddAnimalSubmit,
    showEditAnimalModal,
    handleEditAnimalSubmit,
    showSmsModal,
    handleSmsSubmit,
    showEligibilityModal,
    evaluateWizard,
    showResetModal,
    showVillageStatusModal,
    showAlertActionModal
  };
})();
