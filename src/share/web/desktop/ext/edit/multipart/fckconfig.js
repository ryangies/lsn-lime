FCKConfig.CoreStyles.Bold			= { Element : 'b' } ;
FCKConfig.CoreStyles.Italic			= { Element : 'i' } ;
FCKConfig.CoreStyles.Underline		= { Element : 'u' } ;

FCKConfig.CoreStyles.FontFace =
	{
		Element		: 'font',
		Attributes	: { 'face' : '#("Font")' }
	} ;

FCKConfig.FontSizes		= '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;72/72px' ;
FCKConfig.CoreStyles.Size =
	{
		Element		: 'font',
		Attributes	: { 'size' : '#("Size")' },
		Styles		: { 'font-size' : '#("Size","fontSize")' }
	} ;

FCKConfig.EnableMoreFontColors = true ;
FCKConfig.CoreStyles.Color =
	{
		Element		: 'font',
		Attributes	: { 'color' : '#("Color")' }
	} ;

FCKConfig.StylesXmlPath = '' ;
FCKConfig.CustomStyles =
	{
	} ;

FCKConfig.ToolbarSets['data-scalar-html'] = [
	['Source','-','Bold','Italic','Underline','-','UnorderedList','-','Link','Unlink'],
	['FontName','FontSize','-','About']
] ;
