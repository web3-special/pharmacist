import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, MenuController, Content, Platform } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { GlobalVars } from '../providers/globalvars';
import { FindNearestPage } from '../find-nearest/find-nearest';
// import { ColdMobilePage } from '../cold-mobile/cold-mobile';
// import { UrgentCarePage } from '../urgent-care/urgent-care';
import { AdultSymptomInfographicsPage } from '../adult-symptom-infographics/adult-symptom-infographics';

@Component({
  selector: 'page-adult-symptom-childs',
  templateUrl: 'adult-symptom-childs.html'
})
export class AdultSymptomChildsPage {

	pagemode = {
		0: 'h',
		1: 'a'
	}
	@ViewChild(Content) content: Content;
	MyContent = {
	    screenWidth: 0,
	    screenHeight: 0,
	  }
	FYIDlg: any;
	firstname: string;
	currentTemp: any;
	dlgcount: number;
	recs: any;
	page: number;
	mode: number;
	subPages: any;
	AbsoluteURL: string;
	temp_html_data: any;
	html_data: any;
	pageId: number;
	setting: any;
	constructor(public navCtrl: NavController, public navParams: NavParams, public menu: MenuController, public platform: Platform,
				public http: Http, private sanitizer: DomSanitizer) {
		this.menu = menu;
		this.AbsoluteURL = GlobalVars.getAbsoluteURL();
		this.page = 0;
		this.pageId = GlobalVars.getPageId();
    	this.setting = GlobalVars.getPageSetting(this.pagemode[this.pageId]);
    	this.firstname = GlobalVars.getFirstname();
    	this.currentTemp = 0;
	  	if (this.firstname != "")
	  		this.firstname += ",";
    	this.html_data =  null;
		this.subPages = [
				{	// 201 UrgentCarePage
					"id": 0,
					"page": FindNearestPage
				},
				{	// 202 UrgentCarePage
					"id": 1,
					"page": FindNearestPage
				},
				{	// 203 AdultSymptomInfographicsPage
					"id": 0,
					"page": AdultSymptomInfographicsPage
				},
				{	// 204 AdultTakeMobileListPage
					"id": 0,
					"page": AdultSymptomInfographicsPage
				},
				{	// 205 SinusPressureMobilePage
					"id": 24,
					"page": AdultSymptomChildsPage
				},
				{	// 205 AllergiesMobilePage
					"id": 0,
					"page": AdultSymptomChildsPage
				}
			];
		this.recs = [
			false, false, false, false, false, false, false, false, false, false, false, false, false
		];
		this.mode = 0;
	}
	getTitle(){
	    if (this.html_data != null)
	    {
	    	let navbar = this.html_data[this.pageId].navbar;
	    	let title: string;
	    	for (let each in navbar) {
	    		if (navbar[each]['min'] <=this.page && navbar[each]['max']>this.page)
	    		{
	    			title = navbar[each]['content'];
	    		}
	    	}
	    	if (title == "firstname") title = this.firstname;
	    	return title;
	    }
	    else
			return "";
	}
	getHeader(){
		if (this.html_data != null){
			let data = this.html_data[this.pageId]['pages'][this.page]['header'];
			data = data.replace("{{currentTemp}}", this.currentTemp);
			data = data.replace("{{firstname}}", this.firstname);
			return data;
		}
		else
			return "";
	}
	getHtmlData(){
	    this.html_data =  null;
	    this.http.get("assets/json/adult_symptom_childs.json").map(response => response.json()).subscribe(data => {
	        this.html_data = data;
	        this.FYIDlg = this.html_data[this.pageId]['fyidlg'];
	        this.dlgcount = this.FYIDlg.length;
	    });
	}
	showMenu() {
	    var menu = document.querySelector( 'ion-menu ion-content' );
	    var setting = GlobalVars.getPageSetting(this.pagemode[this.pageId]);
	    menu.className = "outer-content content" + " " + setting['class'];
	  	this.menu.open();
	}
	processFunc(button: any){
		if (button.go >= 0)
		{
			let slider, myslider, options;
			myslider = this.html_data[this.pageId]['pages'][this.page]['slider'];
			if (myslider != undefined && myslider != null)
			{
				let sliderstep = this.html_data[this.pageId]['pages'][this.page]['sliderstep'], go = this.page+1;
				for (let each in sliderstep) {
		    		if (sliderstep[each]['min'] <this.page && sliderstep[each]['max']>=this.page)
		    		{
		    			go = sliderstep[each]['go']; break;
		    		}
		    	}
		    	this.togglePage(go);
			}
			else
			{
				slider = this.html_data[this.pageId]['pages'][button.go]['slider'];
				options = this.html_data[this.pageId]['pages'][button.go]['options'];
				if (slider != undefined && slider != null)
					this.currentTemp = slider['min'];
				if (options != undefined && options != null)
				{
					for (let i=0;i<this.recs.length;i++)
						this.recs[i] = false;
				}
				this.togglePage(button.go);
			}
		}
		else if (button.go>-200 && button.go<=-100)
			this.toggleFYIDlg(true, -button.go-101);
		else{
			let ind = 0-button.go-201;
			GlobalVars.setPageId(this.subPages[ind].id);
			this.navCtrl.push(this.subPages[ind].page);
		}
	}
	toggleFYIDlg(b: boolean, id: number) {
		if (b)
		{
			var scrollPos = this.content.getContentDimensions().scrollTop;
			this.MyContent.screenWidth = this.platform.width();
			this.MyContent.screenHeight = this.platform.height();
			this.FYIDlg[id].width = this.MyContent.screenWidth * 0.9;
			this.FYIDlg[id].maxWidth = 600;
			if (this.FYIDlg[id].width > this.FYIDlg[id].maxWidth)
				this.FYIDlg[id].width = this.FYIDlg[id].maxWidth;
			this.FYIDlg[id].left = (this.MyContent.screenWidth - this.FYIDlg[id].width) / 2;
			this.FYIDlg[id].top = (this.MyContent.screenHeight - this.FYIDlg[id].height) / 2 + scrollPos - 60;
		}
		this.FYIDlg[id].show = b;
	}
	toggleRecs(ind: number){
		if (ind == 10){
			this.recs[9] = false;
			this.toggleAllRecs(false);
		}
		else if (ind == 9){
			this.recs[10] = false;
			this.toggleAllRecs(true);
		}
		else
			this.recs[10] = false;
	}
	toggleAllRecs(b: boolean){
		for (let i=0;i<9;i++)
			this.recs[i] = b;
	}
	togglePage(ind: number) {
		if (this.pageId == 0 && ind == 32)
		{
			let len = 0;
			for (let i=0;i<5;i++)
			{
				if (this.recs[i] == true) len++;
			}
			if (this.recs[10] == true)
				this.page = 32;
			else if (len>0)
				this.page = 33;
			else{
				this.mode = 100;
				ind = 31;
			}
		}
		else if (this.pageId == 1 && ind == 11){
			let trueCount = 0;
		  	for (let i=0;i<this.recs.length-1;i++)
		  		if (this.recs[i] == true)
		  			trueCount ++;
	    	if (this.recs[10] == true)
	    		this.mode = 1;
	    	else if (this.recs[9] == true)
	    		this.mode = 2;
	    	else if (this.recs[8] == true)
	    		this.mode = 3;
	    	else if (this.recs[3] == false && trueCount > 0)
	    		this.mode = 4;
	    	else if (trueCount > 0)
	    		this.mode = 5;
	    	else{
	    		this.mode = 6;
	    		ind = 10;
	    	}
	    	if (this.mode != 6)
	    		ind = 11 + this.mode - 1;
		}
		this.page = ind;
	}
	ionViewDidLoad() {
		this.getHtmlData();
	}

}