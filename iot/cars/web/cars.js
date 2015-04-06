var IOT_TOPIC = 'cars_topic';
var KAAZING_ID = 'd71dfe3a-818e-4f9c-8af6-fb81649d9a6d';  
var MAX_COOLANT = 300;
var MAX_RPM = 5000;
var MAX_SPEED = 100;
var RADIUS_VSS = 262;
var RADIUS_VSS_DASH = 275;
var RADIUS_RPM = 238;
var RADIUS_RPM_DASH = 225;
var SVG_PATH = 'http://www.w3.org/2000/svg';
var VIDEO_PATH = 'http://temp.kevinhoyt.com/kaazing/iot/cars/playback.mp4';
var VIDEO_TYPE = 'video/mp4';
  
var ecu = {
  vss: 0.35,
  rpm: 0.60,
  temp: 0.50
};
var kaazing = null;
var map = {
  google: null,
  marker: null,
  path: [],
  root: null,
  route: null
};
var svg = {
  element_rpm: null,
  element_temp: null,
  element_vss: null,
  radius_rpm: ( 2 * Math.PI * RADIUS_RPM ) * ( 180 / 360 ),
  radius_vss: ( 2 * Math.PI * RADIUS_VSS ) * ( 180 / 360 ),
  root: null
};
var video = {
  element: null,
  first: null,
  playing: null,
  popcorn: null,
  start: 0
};
  
function draw()
{
  vss();
  rpm();
  temp();
}
  
function rpm()
{
  var adjacent = null;
  var opposite = null;
  var path = null;
  
  // RPM
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 10 );
  path.setAttribute( 'stroke', 'rgb( 72, 72, 72 )' );
  path.setAttribute( 'fill', 'rgba( 72, 72, 72, 0 )' );  
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_RPM ) + ', 325 ' + 
    'A 238, 238 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_RPM ) + ( 2 * RADIUS_RPM ) ) + ', 325' 
  );
  svg.root.appendChild( path );  
  
  // RPM dashes
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'stroke', 'white' );
  path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );  
  // path.setAttribute( 'stroke-dasharray', '18.84, 2' );
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_RPM_DASH ) + ', 325 ' + 
    'A 225, 225 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_RPM_DASH ) + ( 2 * RADIUS_RPM_DASH ) ) + ', 325' 
  );
  svg.root.appendChild( path );    
  
  // RPM red zone
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'fill', 'rgba( 255, 0, 0, 0 )' );
  path.setAttribute( 'stroke', 'red' );
  path.setAttribute( 'stroke-dashoffset', svg.radius_rpm + ( svg.radius_rpm * 0.247 ) );  
  path.setAttribute( 'stroke-dasharray', svg.radius_rpm );        
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_RPM_DASH ) + ', 325 ' + 
    'A 225, 225 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_RPM_DASH ) + ( 2 * RADIUS_RPM_DASH ) ) + ', 325' 
  );
  svg.root.appendChild( path );   
  
  // RPM tick marks
  for( var d = 0; d < 6; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - RADIUS_RPM_DASH );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 15 );
    path.setAttribute( 'height', 2 );
    
    if( d > 3 )
    {
      path.setAttribute( 'fill', 'red' );      
    } else {
      path.setAttribute( 'fill', 'white' );      
    }

    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( 36.10 * d ) + ', ' + ( window.innerWidth / 2 ) + ', 323 )' );
    svg.root.appendChild( path );    
  }    
  
  // RPM dashes
  for( var d = 0; d < 24; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - RADIUS_RPM_DASH - 3 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 7 );
    path.setAttribute( 'height', 2 );
    
    if( ( ( d + 1 ) % 5 ) == 0 ) 
    {
      path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );      
    } else {
      path.setAttribute( 'fill', 'black' );      
    }
  
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( ( 7.22 * d ) + 7.22 ) + ', ' + ( window.innerWidth / 2 ) + ', 325 )' );
    svg.root.appendChild( path );    
  }         
  
  // RPM indicators  
  for( var d = 0; d < 6; d++ ) 
  {
    opposite = Math.sin( ( d * 36.08 ) * ( Math.PI / 180 ) ) * 202;
    adjacent = Math.cos( ( d * 36.08 ) * ( Math.PI / 180 ) ) * 202;

    path = document.createElementNS( SVG_PATH, 'text' );
    path.textContent = d;
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - adjacent );
    path.setAttribute( 'font-size', 22 );
    
    if( d == 2 || d == 3 ) {
      path.setAttribute( 'y', 325 + 10 - opposite );            
    } else {
      path.setAttribute( 'y', 325 + 5 - opposite );            
    }
    
    if( d < 3 )
    {
      path.setAttribute( 'text-anchor', 'start' );      
    } else if( d > 2 ) {
      path.setAttribute( 'text-anchor', 'end' );            
    }

    svg.root.appendChild( path );          
  }  
  
  // Units
  opposite = Math.sin( 90 * ( Math.PI / 180 ) ) * 160;
  adjacent = Math.cos( 90 * ( Math.PI / 180 ) ) * 160;

  path = document.createElementNS( SVG_PATH, 'text' );
  path.textContent = 'x1000/min';
  path.setAttribute( 'fill', 'white' );
  path.setAttribute( 'x', ( window.innerWidth / 2 ) - adjacent );
  path.setAttribute( 'y', 325 - opposite );        
  path.setAttribute( 'font-size', 14 );
  path.setAttribute( 'text-anchor', 'middle' );      
  svg.root.appendChild( path );          
}

function temp() 
{
  var adjacent = null;
  var opposite = null;
  var path = null;
  
  // Temperature
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 10 );
  path.setAttribute( 'stroke', 'rgb( 72, 72, 72 )' );
  path.setAttribute( 'fill', 'rgba( 72, 72, 72, 0 )' );
  // 325 - 100 = 225
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 225 ' +
    'A 100, 100 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 100 ) ) + ', 325' 
  );
  svg.root.appendChild( path );   
  
  // Temperature dashes
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'stroke', 'white' );
  path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 212 ' + 
    'A 113, 113 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 113 ) ) + ', 325' 
  );
  svg.root.appendChild( path );   
  
  // Temperature red zone
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'fill', 'rgba( 255, 0, 0, 0 )' );
  path.setAttribute( 'stroke', 'red' );
  path.setAttribute( 'fill', 'rgba( 255, 0, 0, 0 )' );
  path.setAttribute( 'stroke-dashoffset', 314 );  
  path.setAttribute( 'stroke-dasharray', 314 + ( 314 * 0.14 ) );        
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 212 ' + 
    'A 113, 113 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 113 ) ) + ', 325' 
  );
  svg.root.appendChild( path );     
  
  // Temperature tick marks
  for( var d = 0; d < 3; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 110 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 15 );
    path.setAttribute( 'height', 2 );
    
    if( d == 2 )
    {
      path.setAttribute( 'fill', 'red' );            
    } else {
      path.setAttribute( 'fill', 'white' );            
    }

    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( -45 * d ) + ', ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 323 )' );
    svg.root.appendChild( path );    
  }      
  
  // Temperature dash marks
  for( var d = 0; d < 2; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 108 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 8 );
    path.setAttribute( 'height', 2 );
    
    path.setAttribute( 'fill', 'black' );            

    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( ( -45 * d ) - 22.5 ) + ', ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 323 )' );
    svg.root.appendChild( path );    
  }        
  
  // Temperature values
  for( var d = 0; d < 3; d++ ) 
  {
    opposite = Math.sin( ( d * 45 ) * ( Math.PI / 180 ) ) * 130;                                                                                                                                                                                                                                                                                                                                                          ( ( d * 36.08 ) * ( Math.PI / 180 ) ) * 202;
    adjacent = Math.cos( ( d * 45 ) * ( Math.PI / 180 ) ) * 130;

    path = document.createElementNS( SVG_PATH, 'text' );
    
    if( d == 2 )
    {
      path.textContent = ( d * 180 ) + '\u00B0F';      
    } else {
      path.textContent = d * 180;      
    }
    
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + adjacent );
    
    if( d == 0 ) {
      path.setAttribute( 'y', 325 + 4 - opposite );                      
    } else if( d == 2 ) {
      path.setAttribute( 'y', 325 - 4 - opposite );                            
    } else {
      path.setAttribute( 'y', 325 - opposite );                      
    }

    if( d == 2 ) {
      path.setAttribute( 'text-anchor', 'middle' ); 
    }
    
    path.setAttribute( 'font-size', 18 );
    svg.root.appendChild( path );          
  }    
  
  // Icon
  path = document.querySelector( '.temperature' );
  path.style.left = ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 25 ) + 'px';                              
}
  
function update() 
{
  // RPM
  if( svg.element_rpm == null )
  {
    svg.element_rpm = document.createElementNS( SVG_PATH, 'path' );
    svg.element_rpm.setAttribute( 'stroke-width', 10 );
    svg.element_rpm.setAttribute( 'stroke', 'rgb( 81, 141, 163 )' );    
    svg.element_rpm.setAttribute( 'fill', 'rgba( 81, 141, 163, 0 )' );  
    svg.element_rpm.setAttribute( 'filter', 'url( #glow )' );    
    svg.element_rpm.setAttribute( 'stroke-dashoffset', svg.radius_rpm );  
    svg.element_rpm.setAttribute( 'stroke-dasharray', svg.radius_rpm + ( svg.radius_rpm * ecu.rpm ) );        
    svg.element_rpm.setAttribute( 'd', 
      'M ' + ( ( window.innerWidth / 2 ) - RADIUS_RPM ) + ', 325 ' + 
      'A 238, 238 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_RPM ) + ( 2 * RADIUS_RPM ) ) + ', 325' 
    );
    svg.root.appendChild( svg.element_rpm );         
  } else {
    svg.element_rpm.setAttribute( 'stroke-dasharray', svg.radius_rpm + ( svg.radius_rpm * ecu.rpm ) );    
  }
  
  // VSS
  if( svg.element_vss == null )
  {
    svg.element_vss = document.createElementNS( SVG_PATH, 'path' );
    svg.element_vss.setAttribute( 'stroke-width', 10 );
    svg.element_vss.setAttribute( 'stroke', 'rgb( 98, 189, 106 )' );
    svg.element_vss.setAttribute( 'fill', 'rgba( 98, 189, 106, 0 )' );  
    svg.element_vss.setAttribute( 'filter', 'url( #glow )' );        
    svg.element_vss.setAttribute( 'stroke-dashoffset', svg.radius_vss );  
    svg.element_vss.setAttribute( 'stroke-dasharray', svg.radius_vss + ( svg.radius_vss * ecu.vss ) );        
    svg.element_vss.setAttribute( 'd', 
      'M ' + ( ( window.innerWidth / 2 ) - RADIUS_VSS ) + ', 325 ' + 
      'A 262, 262 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_VSS ) + ( 2 * RADIUS_VSS ) ) + ', 325' 
    );
    svg.root.appendChild( svg.element_vss );         
  } else {
    svg.element_vss.setAttribute( 'stroke-dasharray', svg.radius_vss + ( svg.radius_vss * ecu.vss ) );    
  }  
  
  // Temperature
  if( svg.element_temp == null )
  {
    svg.element_temp = document.createElementNS( SVG_PATH, 'path' );
    svg.element_temp.setAttribute( 'stroke-width', 10 );
    svg.element_temp.setAttribute( 'stroke', 'rgb( 81, 141, 163 )' );
    svg.element_temp.setAttribute( 'fill', 'rgba( 81, 141, 163, 0 )' );
    svg.element_temp.setAttribute( 'filter', 'url( #glow )' );            
    svg.element_temp.setAttribute( 'stroke-dashoffset', 157 + ( 157 * ecu.temp ) );  
    svg.element_temp.setAttribute( 'stroke-dasharray', 157 );            
    svg.element_temp.setAttribute( 'd', 
      'M ' + ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) ) + ', 225 ' +
      'A 100, 100 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) + ( window.innerWidth / 3 ) + 100 ) ) + ', 325' 
    );
    svg.root.appendChild( svg.element_temp );   
  } else {
    svg.element_temp.setAttribute( 'stroke-dashoffset', 157 + ( 157 * ecu.temp ) );        
  }
}
  
function vss() 
{
  var adjacent = null;
  var opposite = null;
  var path = null;
  
  // VSS
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 10 );
  path.setAttribute( 'stroke', 'rgb( 72, 72, 72 )' );
  path.setAttribute( 'fill', 'rgba( 72, 72, 72, 0 )' );  
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_VSS ) + ', 325 ' + 
    'A 262, 262 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_VSS ) + ( 2 * RADIUS_VSS ) ) + ', 325' 
  );
  svg.root.appendChild( path );

  // VSS dashes
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'stroke-width', 6 );
  path.setAttribute( 'fill', 'rgba( 255, 255, 255, 0 )' );
  path.setAttribute( 'stroke', 'white' );
  // path.setAttribute( 'stroke-dasharray', '62, 2' );
  path.setAttribute( 'd', 
    'M ' + ( ( window.innerWidth / 2 ) - RADIUS_VSS_DASH ) + ', 325 ' + 
    'A 275, 275 0 0, 1 ' + ( ( ( window.innerWidth / 2 ) - RADIUS_VSS_DASH ) + ( 2 * RADIUS_VSS_DASH ) ) + ', 325' 
  );
  svg.root.appendChild( path );  
    
  // VSS tick marks
  for( var d = 0; d < 11; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - RADIUS_VSS_DASH - 12 );
    path.setAttribute( 'y', 323 );
    path.setAttribute( 'width', 15 );
    path.setAttribute( 'height', 2 );
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( 18.04 * d ) + ', ' + ( window.innerWidth / 2 ) + ', 323 )' );
    svg.root.appendChild( path );    
  }
  
  // VSS dashes
  for( var d = 0; d < 11; d++ )
  {
    path = document.createElementNS( SVG_PATH, 'rect' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - RADIUS_VSS_DASH - 4 );
    path.setAttribute( 'y', 325 );
    path.setAttribute( 'width', 7 );
    path.setAttribute( 'height', 2 );
    path.setAttribute( 'fill', 'black' );
    path.setAttribute( 'stroke', 'rgba( 255, 255, 255, 0 )' );
    path.setAttribute( 'transform', 'rotate( ' + ( ( 18.04 * d ) + 9.02 ) + ', ' + ( window.innerWidth / 2 ) + ', 325 )' );
    svg.root.appendChild( path );    
  }        
  
  // Speed indicators  
  for( var d = 0; d < 11; d++ ) 
  {
    opposite = Math.sin( ( d * 18.04 ) * ( Math.PI / 180 ) ) * 295;
    adjacent = Math.cos( ( d * 18.04 ) * ( Math.PI / 180 ) ) * 295;

    path = document.createElementNS( SVG_PATH, 'text' );
    path.textContent = d * 10;
    path.setAttribute( 'fill', 'white' );
    path.setAttribute( 'x', ( window.innerWidth / 2 ) - adjacent );
    path.setAttribute( 'font-size', 22 );
    
    if( d == 0 || d == 10 ) {
      path.setAttribute( 'y', 325 + 5 - opposite );      
    } else {
      path.setAttribute( 'y', 325 - opposite );      
    }
    
    if( d < 5 )
    {
      path.setAttribute( 'text-anchor', 'end' );      
    } else if( d == 5) {
      path.setAttribute( 'text-anchor', 'middle' );            
    } else if( d > 5 ) {
      path.setAttribute( 'text-anchor', 'start' );            
    }

    svg.root.appendChild( path );          
  }
  
  // Units
  opposite = Math.sin( 9.02 * ( Math.PI / 180 ) ) * 295;
  adjacent = Math.cos( 9.02 * ( Math.PI / 180 ) ) * 295;

  path = document.createElementNS( SVG_PATH, 'text' );
  path.textContent = 'mph';
  path.setAttribute( 'fill', 'white' );
  path.setAttribute( 'x', ( window.innerWidth / 2 ) - adjacent );
  path.setAttribute( 'y', 325 + 3 - opposite );        
  path.setAttribute( 'font-size', 14 );
  path.setAttribute( 'text-anchor', 'end' );      
  svg.root.appendChild( path );        
}  
  
function doGatewayConnect() {
  console.log( 'Client connected.' );
  
  // Listen on topic for messages
  kaazing.on( Gateway.EVENT_MESSAGE, doGatewayMessage );
  kaazing.subscribe( IOT_TOPIC );  
}  

function doGatewayMessage( message ) {
  var data = null;

  // Parse data
  data = JSON.parse( message );

  // Start video on first message
  if( video.popcorn != null )
  {
    if( !video.playing ) 
    {
      video.first = data.time;
      video.playing = true;
      video.popcorn.play( video.start );        
    } else if( video.playing ) {
      if( video.first == data.time ) 
      {
        video.popcorn.play( video.start );                
      }
    }
  }
    
  // Build polyline
  map.route.getPath().push( new google.maps.LatLng( data.latitude, data.longitude ) );
  map.google.panTo( new google.maps.LatLng( data.latitude, data.longitude ) );
  
  // Update marker
  map.marker.setPosition( new google.maps.LatLng( data.latitude, data.longitude ) );
  
  // Update dashboard
  TweenMax.to( ecu, 1, {
    rpm: data.rpm / MAX_RPM,
    vss: data.speed / MAX_SPEED,
    temp: data.coolant / MAX_COOLANT,
    onUpdate: update
  } )
}  
  
function doWindowLoad()
{
  var options = null;
  var script = null;
  var source = null;

  // Video playback
  if( URLParser( window.location.href ).hasParam( 'playback' ) )
  {
    console.log( 'Video requested.' );
    
    video.playing = false;
    video.start = parseInt( URLParser( window.location.href ).getParam( 'playback' ) );
        
    video.popcorn = Popcorn( 'video' );
    
    video.element = document.querySelector( 'video' );
    video.element.style.visibility = 'visible';
    
    source = document.createElement( 'source' );
    source.src = VIDEO_PATH;
    source.type = VIDEO_TYPE;
    video.element.appendChild( source );

    video.element.addEventListener( 'canplaythrough', function( evt ) {
      console.log( 'Video loaded.' );
    } );
    video.element.load();
  }  
  
  // Gateway
  kaazing = Gateway.connect( KAAZING_ID, doGatewayConnect );    
  
  options = {
    center: new google.maps.LatLng( 39.4975231, -104.7791048 ),
    zoom: 16        
  };  
  
  map.root = document.querySelector( '.map' );
  map.google = new google.maps.Map( map.root, options );  
  map.marker = new google.maps.Marker( {
    position: new google.maps.LatLng( 39.4975231, -104.7791048 ),
    map: map.google,
    icon: {
      anchor: new google.maps.Point( 12, 9 ),
      url: 'car.svg'  
    }
  } );
  
  map.route = new google.maps.Polyline( {
    path: map.path,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 5
  } );  
  map.route.setMap( map.google );
  
  svg.root = document.querySelector( 'svg' );
  svg.root.style.width = window.innerWidth + 'px';
    
  draw();
}
  
window.addEventListener( 'load', doWindowLoad );  
