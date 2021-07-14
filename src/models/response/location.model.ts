import { MarkerIconType } from "../marker-icon-type";

/**
 * Location Marker info object 
 */
export class LocationInfo {
    /**
     * Unique Id for the given location
     */
    Id: number;
    /**
     * Name to display for the given marker
     */
    Name: string;
    /**
     * Image path to display for the given marker
     */
    ImagePath: string;
    /**
     * Information to display in the body of the modal
     */
    DisplayInformation: string;
    /**
     * Information that will be read by the TTS
     * this gives us the option to format stuff weird so it reads correctly.
     */
    SpeakingInformation: string;
    /**
     * City to display on the modal
     */
    City: string;
    /**
     * State to display on the modal
     */
    State: string;
    /**
     * Longitude for the given marker
     */
    Longitude: number;
    /**
     * Latitude for the given marker
     */
    Latitude: number;
    /**
     * Dictates the icon that should be used for the marker. 
     */
    LocationType: MarkerIconType;
    /**
     * The last found distance found for the given location
     */
    CurrentDistanceMiles: number = -1;
    /**
     * Determines if the location has played before
     */
    HasPlayed: boolean = false;
    /**
     * Date and Time to display when the location has been read.
     */
    AddedToPlacesDate: Date;
}
